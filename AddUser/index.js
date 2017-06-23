import Icon from 'material-ui/svg-icons/social/person';

import React, { Component } from 'react';
import {
    BooleanField,
    BooleanInput,
    CheckboxGroupInput,
    Create,
    Datagrid,
    DateField,
    DateInput,
    DisabledInput,
    Edit,
    EditButton,
    Filter,
    FormTab,
    ImageField,
    ImageInput,
    List,
    LongTextInput,
    NumberField,
    NumberInput,
    ReferenceManyField,
    Responsive,
    RichTextField,
    SelectField,
    SelectInput,
    Show,
    ShowButton,
    SimpleForm,
    SimpleList,
    SimpleShowLayout,
    TabbedForm,
    TextField,
    TextInput,
    minValue,
    number,
    required,
    translate,
} from 'admin-on-rest';

import RichTextInput from 'aor-rich-text-input';
import Chip from 'material-ui/Chip';  
import MyEditButton from './EditButton';
import TextRoles from './TextRoles';
import {websockClient} from '../asteroid';

export const AddUserIcon = Icon;
const rowStyle = (record) => {
   // if (record.status === "检测完成") return { backgroundColor: '#dfd' }; 
    return {};
}; 

export const AddUserList = ({ ...props }) => (
    <List {...props} perPage={25} sort={{ field: 'id', order: 'ASC' }}  >
        <Responsive
            small={
                <SimpleList
                    primaryText={record => record.title} 
                />
            }
            medium={
                <Datagrid rowStyle={rowStyle}  >
                    <TextField source="id" />
                    <TextField source="username" /> 
                    <TextField source="password" /> 
                    <TextRoles source="role"  />    
                    <MyEditButton source="reset"/> 
                </Datagrid>
            }
        />
    </List>
);
export class AddUserEdit extends Component {
    render(){
        return(
    <Edit {...this.props} >
        <SimpleForm > 
            <TextField source="id"  style={{  width: 128,display: 'inline-block' }} />
            <TextField source="username"  style={{  width: 128,display: 'inline-block', marginLeft: 32  }} />
            <TextField source="password"  style={{  width: 128,display: 'inline-block', marginLeft: 32 }} />
            <SelectInput source="role" choices={choices} optionText="name" optionValue="role" />
         </SimpleForm>
    </Edit>);
}
};

const choices=[
    { role: 1, name: '管理员' },
    { role: 6, name: '业务员' },
    { role: 7, name: '仓库操作员' }, 
    { role: 8, name: '检测任务分配员' }, 
    { role: 9, name: '检测员' }, 
    { role: 20, name: '正常' }, 
    { role: 30, name: '不可见' }, 
    { role: 31, name: '已删除' }, 
];
 
const handleOnBlur=(e)=>{
      var setusername=e.target.value;
      var checkResult=websockClient('GET_ONE','AddUser',{'Mytype':'checkUsername','username':setusername}); 
      checkResult.then(response => console.log('---',response.data)); 
      e.target.value='x';

}

var err="x";
const validateUserSetusername = (values) => {
    var  errors = [];
    var setusername=values;
    console.log('---',setusername);
    var checkResult=websockClient('GET_ONE','AddUser',{'Mytype':'checkUsername','username':setusername}); 
    checkResult.then(response => {if(response.data){ console.log('--存在-',); return errors = ['账户已存在'];}});   
   
    
    return errors
};

var flagCheckUsername=0;
const validateUserCreation = (values) => {
    const errors = {}; 
   console.log('--valuse -',values);
    //errors.username = ['The firstName is required'];
 
    var setusername=values.username;
    if(!setusername){
       errors.username = ['账户名不能为空'];
    }else  if((setusername!='用户名已存在')){ 
    console.log('---',setusername);
     // var checkResult=websockClient('GET_ONE','AddUser',{'Mytype':'checkUsername','username':setusername}); 
      websockClient('GET_ONE','AddUser',{'Mytype':'checkUsername','username':setusername})
       .then(response => {if(response.data){ console.log('--存在-',); flagCheckUsername=1; values.username='用户名已存在';errors.username = ['用户名已存在']; return errors}});   
    } 
    var setpassword=values.password;
    console.log(setpassword);
    if(!setpassword){
      errors.password = ['密码不能为空'];
    }else if(setpassword.length<6)
    {
       errors.password = ['密码太短了'];
    }
    if(!(values.role))
    {
         errors.role = ['角色不能为空'];
    } 
    return errors 
};

//validate={validateUserSetusername}
export const AddUserCreate = (props) => (
    <Create {...props}  title="新建 账户">
        <SimpleForm  validate={validateUserCreation}>  
            <TextInput source="username"  />   
            <TextInput source="password" /> 
            <SelectInput source="role" choices={choices} optionText="name" optionValue="role" />
        </SimpleForm>
    </Create>
);
 