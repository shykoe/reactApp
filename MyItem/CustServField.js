import React from 'react';

const CustServField = ({ record }) => {
  const history = [];
  if (record.activeCustServRequest) {
    history.push({
      request: record.activeCustServRequest
    });
  }
  if (record.custServHistory) {
    for (const item of record.custServHistory) {
      history.push({
        request: item.request,
        reply: item.reply
      });
    }
  }

  const items = history.map(item => {
    return (
      <div key={item.request + (item.reply || '')}>
        <div>售后要求: {item.request}</div>
        <div>答复: {item.reply || ''}</div>
      </div>
    );
  });

  return(
    <div>
      {items}
    </div>
  );
};

CustServField.defaultProps = {
  addLabel: true,
};

export default CustServField;
