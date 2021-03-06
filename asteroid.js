import { createClass } from 'asteroid';
import {
    GET_LIST,
    GET_ONE,
    GET_MANY,
    GET_MANY_REFERENCE,
    CREATE,
    UPDATE,
    DELETE,
} from 'admin-on-rest';
import { CHANGEPWD } from './UserCenter/ChangePwdAction';
import Consts from './pr-schema/consts';

const statusMap = {
  '未认领': Consts.ORDER_STATUS_UNCLAIMED,
  '已认领': Consts.ORDER_STATUS_CLAIMED,
  '审核被拒绝': Consts.ORDER_STATUS_REJECTED,
  '审核通过': Consts.ORDER_STATUS_APPROVED,
  '订单关闭': Consts.ORDER_STATUS_CLOSED,
  '已支付': Consts.ORDER_STATUS_PAID,
  '已安排物流': Consts.ORDER_STATUS_PROCESSED,
  '已收到样品': Consts.ORDER_STATUS_SAMPLE_RECEIVED,
  '检验任务已分配': Consts.ORDER_STATUS_ASSIGNED,
  '检验完成': Consts.ORDER_STATUS_TESTED,
  '检验报告已寄出': Consts.ORDER_STATUS_REPORT_SHIPPED,
  '订单完成': Consts.ORDER_STATUS_COMPLETED,
  '已退款': Consts.ORDER_STATUS_REFUNDED
}

function mapStatusKey(filter, value) {
  if (value) {
    switch(value) {
      case '未认领':
        filter.status = Consts.ORDER_STATUS_UNCLAIMED;
        if (filter.agentId && filter.agentId.$eq !== undefined && filter.agentId.$eq !== null) {
          filter.agentId = { eq: 'N/A' };
        } else {
          filter.agentId = {
            ...filter.agentId,
            $eq: null
          };
        }
        break;
      case '已认领':
        filter.status = Consts.ORDER_STATUS_UNCLAIMED;
        if (filter.agentId && filter.agentId.$ne !== undefined && filter.agentId.$ne !== null) {
          filter.agentId = { eq: 'N/A' };
        } else {
          filter.agentId = {
            ...filter.agentId,
            $ne: null
          };
        }
        break;
      default:
        filter.status = statusMap[value] || value;
    }
  }

  return filter;
}

function procFilter(fltr, route) {
  let filter = {};

  if (fltr) {
    // 特殊处理status和status2
    if (Array.isArray(fltr.status2)) {
      if (fltr.status && fltr.status2.find(fltr.status) === -1) {
        filter.status = { $eq: 'N/A' };
      } else {
        filter.status = {
          $in: fltr.status2.map(item => statusMap[item])
        };
      }
    } else {
      if (fltr.status && fltr.status2 && fltr.status !== fltr.status2) {
        filter.status = { $eq: 'N/A' };
      } else {
        const status = fltr.status || fltr.status2;
        if (status) {
          filter = mapStatusKey(filter, status);
        }
      }
    }

    for (const key in fltr) {
      if (key !== 'status' && key !== 'status2') {
        let value = fltr[key];

        if (route === 'ApplyItem') {
          if (key === 'agentId2') {
            if (value === null) {
              if (filter.agentId && filter.agentId.$eq !== undefined &&
                  filter.agentId.$eq !== null) {
                filter.agentId = { eq: 'N/A' };
              } else {
                filter.agentId = {
                  ...filter.agentId,
                  $eq: null
                };
              }
            }
            continue;
          }
        }

        if (value) {
          if (typeof value === 'string') {
            value = '.*' + value + '.*';
            value = { '$regex': value, $options: '$i' };
          }
          filter[key] = value;
        }
      }
    }
  }

  return filter;
}

const Asteroid = createClass();
// Connect to a Meteor backend
export const asteroid = new Asteroid({
  endpoint: 'ws://localhost:3333/websocket',
});
export const asteroidMethod = asteroid.call;

const mapResponse2Rest = (response, type, params)=>{
  if (response.errors) {
    throw new Error(response.errors);
  }
	switch(type) {
		case GET_LIST:
      const data = response.data || [];
			data.map((item)=>{item['id']=item._id});
			return { data, total: response.total };
		case GET_ONE:
			response['id'] = response._id;
			return {data: response};
		default:
			response['id'] = response._id ? response._id : response.id ;
			return {data: response};
	}
}

const mapResponse2RestAddI = (response, type, params,page, perpage)=>{
	// const { headers, json } = response;
  if (response.errors) {
    throw new Error(response.errors);
  }
	switch(type) {
		case GET_LIST:
	     //skiped = ( parseInt(page) - 1 ) * parseInt(perpage);
	     var i = (parseInt(page) - 1) * parseInt(perpage) + 1;
			 for (var key in response) {
        	response[key]["id"]=response[key]["_id"];
          ++i;
       }
			return { data: response, total: response.length };
		case GET_ONE:
	    if(response==false){
	    	//console.log('--zero-')
	    	return false;
	    }
	    return {data:response};
		case UPDATE:
		 	return {data:response};
		case CREATE:
      response['id'] = response._id ;
		 	return {data:response};
	}
}

export const websockClient = (type, resource, params) =>{
	console.log(type, resource, params);
	switch (resource) {
		case 'MyItem': {
      switch(type) {
      	case GET_LIST: {
  				const { page, perPage } = params.pagination;
	        const { field, order } = params.sort;
	        const { username, role, filter } = params;

	        return asteroid.call('agent.myorders.get', username, role, page, perPage, field, order,
                               procFilter(filter, 'MyItem')).then(
                               response => mapResponse2Rest(response, type, params));
        }
      	case GET_ONE: {
      		const { id } = params;
      		return asteroid.call('order.get',id)
      		  .then(response => mapResponse2Rest(response, type, params));
      	}
      	case UPDATE: {
      		const { id, data, previousData } = params;
      		if (data === previousData) {
      			return mapResponse2Rest(previousData, type, params);
      		}
      		if (previousData.status === Consts.ORDER_STATUS_TESTED) {
      			data.status = Consts.ORDER_STATUS_REPORT_SHIPPED;
      		}
    			return asteroid.call('agent.order.approve', id, data)
    			   .then(response => mapResponse2Rest(response, type, params));
      	}
      }
      break;
		};
		case 'ApplyItem':{
			switch(type){
				case GET_LIST: {
					const { page, perPage } = params.pagination;
	        const { field, order } = params.sort;
	        const { username, role, filter } = params;
	        return asteroid.call('agent.orders.get', username, role, page, perPage, field, order,
                               procFilter(filter, 'ApplyItem')).then(
                               response => mapResponse2Rest(response, type, params));
				}
				case GET_ONE:{
					return asteroid.call('order.get',params.id)
					.then(response => mapResponse2Rest(response, type, params) );
				}
			}
			break;
		};
		case 'MyCheck':{
			switch(type){
				case GET_LIST:{
  				const { page, perPage } = params.pagination;
	        const { field, order } = params.sort;
	        const { username, role, filter } = params;
	        return asteroid.call('tester.orders.get',username, role, page, perPage, field, order,
                               procFilter(filter, 'MyCheck')).then(
                               response => mapResponse2Rest(response, type, params));
				};
				case GET_ONE:{
					const { id } = params;
					return asteroid.call('order.get',id)
            		.then(response => mapResponse2Rest(response, type, params));
				}
				case UPDATE:{
					const { id, data, previousData, username } = params;
					var ops = {};

					if (data.pictures != undefined) {
						const newPictures = data.pictures.filter(p => p instanceof File);
						const reader = new FileReader();
						reader.readAsDataURL(newPictures[0]);
						reader.onload = () => (asteroid.call('tester.img.update', id, reader.result));
					}

					for (let i = 0; i < data.items.length; i++) {
						if (previousData.items[i].verdict !== data.items[i].verdict) {
							ops[data.items[i].name] = data.items[i].verdict;
						}
					}
					return asteroid.call('tester.order.update', id, data, ops, username)
					  .then(response => mapResponse2Rest(response, type, params));
				}
			}
			break;
		};
		case 'Allocatoritems': {
			switch(type){
				case GET_LIST:{
					const { page, perPage } = params.pagination;
	        const { field, order } = params.sort;
          const { filter } = params;
	        return asteroid.call('orders.get', page, perPage, field, order,
                               procFilter(filter, 'Allocatoritems')).then(
                               response => mapResponse2Rest(response, type, params));
				};
				case UPDATE:{
					var { id, data, previousData } = params;
					if(data === previousData){
						return mapResponse2Rest(previousData, type, params);
					}
					data.status = 9;
					return asteroid.call('assigner.tester.set', id, data)
					.then(response => mapResponse2Rest(response, type, params));
				};
				case GET_ONE:{
					const { id } = params;
					return asteroid.call('order.get',id)
            		.then(response => mapResponse2Rest(response, type, params));
				}

			}
			break;
		};
		case 'Keepers': {
			switch(type) {
				case GET_LIST: {
					const { page, perPage } = params.pagination;
	        const { field, order } = params.sort;
	        const { username, role, filter } = params;
	        return asteroid.call('agent.orders.get', username, role, page, perPage, field, order,
                               procFilter(filter, 'Keepers')).then(
                               response => mapResponse2Rest(response, type, params) );
				};
				case GET_ONE: {
					const { id } = params;
					return asteroid.call('order.get',id)
            		.then(response => mapResponse2Rest(response, type, params));
				};
				case UPDATE: {
					const { id, data, previousData } = params;

					if (data.status === previousData.status) {
						return mapResponse2Rest(previousData, type, params);
					}
					if (data.status === '') {
						data.status = previousData.status;
					}

					if (data.pictures != undefined) {
						const newPictures = data.pictures.filter(p => p instanceof File);
						const reader = new FileReader();
						reader.readAsDataURL(newPictures[0]);
						reader.onload = () => {
              asteroid.call('keeper.img.update', id, reader.result)
            };
					}

					return asteroid.call('keeper.order.update', id, data)
            .then(response => mapResponse2Rest(response, type, params));
				}
			}
			break;
		}
		case 'AddUser': {
      switch(type) {
      	case GET_LIST: {
  			  const { page, perPage } = params.pagination;
          const { field, order } = params.sort;
          return asteroid.call('agent.adduser.get', page, perPage, '_id', order).then(response => mapResponse2Rest (response, type, params));
      	}
      	case GET_ONE: {
      		const {Mytype,username} = params;
      		if (Mytype=='checkUsername') {
      			var temp=asteroid.call('agent.adduser.checkUsername',username).then(response => mapResponse2RestAddI (response, type, params, 0,0));
      	        console.log('-checkUsername-get one result--',temp);
      	        return temp;
      		}
          const {id} = params;
          var temp=asteroid.call('agent.adduser.getOne',id).then(response => mapResponse2RestAddI (response, type, params, 0,0));
      	  console.log('--adduser-get one-',temp,id,params);
      	  return temp;
      	}
      	case UPDATE: {
      		const{data,id}=params;
      		console.log('-adduser-update-',id,data);

      		var temp=asteroid.call('agent.adduser.updateData',id,data).then(response => mapResponse2RestAddI (response, type, params,0,0));
      	  return temp;
      	}
      	case CREATE: {
      		const{data}=params;
      		console.log('--create-',data,params);
      		return asteroid.call('agent.adduser.createUser',data).then(response => mapResponse2RestAddI (response, type, params,0,0));
      	}
      }
		}
    case 'CheckTest':{
      switch(type){
      	case GET_LIST: {
    			const { page, perPage } = params.pagination;
          const { field, order } = params.sort;
          return asteroid.call('agent.checktest.get', page, perPage, 'orderId', order).then(response => mapResponse2Rest (response, type, params));
			  }
      }
		}
		case 'AllOrder': {
      switch(type) {
      	case GET_LIST: {
    			const { page, perPage } = params.pagination;
          const { field, order } = params.sort;
          const { filter } = params;

          return asteroid.call('agent.allorder.get', page, perPage, field, order,
                               procFilter(filter, 'AllOrder')).then(
                               response => mapResponse2Rest(response, type, params));
        }
				case GET_ONE: {
					const { id } = params;
					return asteroid.call('order.get',id)
            		.then(response => mapResponse2Rest(response, type, params));
				}
      }
		}
	}
}
