import React from 'react';
import NavigationRefresh from 'material-ui/svg-icons/navigation/refresh';
import ToggleCheckBox from 'material-ui/svg-icons/toggle/check-box';
import ToggleCheckBoxOutlineBlank from 'material-ui/svg-icons/toggle/check-box-outline-blank'
import { CardActions } from 'material-ui/Card';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import { formValueSelector } from 'redux-form';

class ProcFilterButton extends React.Component{
  ontap = () => {
  	const { filterVal, showFilter } = this.props;
  	if (this.props.filterVal === undefined || this.props.filterVal === '') {
  		showFilter('status2', [
        '未认领',
        '已认领',
        '已支付',
        '检验完成'
      ]);
  	} else {
  		showFilter('status2', '');
  	}
  }

	render(){
		const { icon } = this.props;

		if (this.props.filterVal === undefined || this.props.filterVal === '') {
			return (
				<FlatButton primary label="待处理的订单" onClick={this.ontap} icon={<ToggleCheckBoxOutlineBlank />} />
			);
		} else {
			return (
				<FlatButton primary label="待处理的订单" onClick={this.ontap} icon={<ToggleCheckBox />} />
			);
		}
	}
}

const selector = formValueSelector('filterForm');
export default connect(
	(state, props) => (
		{ filterVal: selector(state, 'status2') }
	)
, null)(ProcFilterButton);
