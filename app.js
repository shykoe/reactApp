import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';

import { Admin, Resource, Delete, englishMessages } from 'admin-on-rest';
import jsonRestClient from 'aor-json-rest-client';
import chineseMessages from 'aor-language-chinese';
import authClient from './authClient';
import { ApplyIcon, ApplyList, ApplyShow } from './Apply';
import { MyItemIcon, MyItemList, MyItemEdit } from './MyItem';
import { PickIcon, PickList, PickShow } from './Pick';
import { MyCheckList, MyCheckEdit } from './MyCheck';
import { AitemsIcon, AitemsList, AitemsShow } from './Allocatoritems';
import { KeepersList, KeepersShow, KeepersIcon, KeepersEdit} from './Keepers';
import { AddUserList, AddUserEdit,AddUserCreate } from './AddUser';
import { AllOrderList, AllOrderEdit,AllOrderCreate, AllOrderShow} from './AllOrder';
import { CheckTestList,CheckTestIcon } from './CheckTest';
import injectTapEventPlugin from 'react-tap-event-plugin';
import data from './data';
import addUploadFeature from './addUploadFeature';
import saga from './saga';
import * as customMessages from './i18n';
import Menu from './Menu';
import { asteroid, websockClient } from './asteroid';
import customRoutes from './routes';
import reportReducer from './reportReducer';
const messages = {
    cn: { ...chineseMessages, ...customMessages.cn },
    en: { ...englishMessages, },
};
try {
    injectTapEventPlugin();
} catch (e) {
    // do nothing
}
const restClient = jsonRestClient(data, true);
const uploadCapableClient = addUploadFeature(restClient);
const delayedRestClient = (type, resource, params) => new Promise(resolve => setTimeout(() => resolve(uploadCapableClient(type, resource, params)), 1000));
render(
    <Admin
        authClient={authClient}
        customSagas={saga}
        customRoutes={customRoutes}
        restClient={websockClient}
        title="系统"
        locale="cn"
        menu={Menu}
        messages={messages}
        customReducers={{ report: reportReducer }}
    >
        <Resource name="ApplyItem" list={ApplyList}  show={ApplyShow} icon={ApplyIcon} role='agent' />
        <Resource name="MyItem" list={MyItemList} edit={MyItemEdit} icon={MyItemIcon} role='agent' />
        <Resource name="MyCheck"  list={MyCheckList} edit={MyCheckEdit} role='tester'/>
        <Resource name="Allocatoritems" list={AitemsList} show={AitemsShow} icon={AitemsIcon} role='assigner'/>
        <Resource name="Keepers" list={KeepersList}  show={KeepersShow} edit={KeepersEdit} icon={KeepersIcon} role='keeper' />
        <Resource name="AddUser"  list={AddUserList} create={AddUserCreate} edit={AddUserEdit} role='admin' />
        <Resource name="AllOrder" list={AllOrderList}  show={AllOrderShow} create={AllOrderCreate} role='admin' />
        <Resource name="CheckTest" list={CheckTestList}  icon={CheckTestIcon} role='admin' />
    </Admin>,
    document.getElementById('root'),
);
