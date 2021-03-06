import React from 'react';
import Chip from 'material-ui/Chip';
import { translate } from 'admin-on-rest';

const styles = {
    main: { display: 'flex', flexWrap: 'wrap' },
    chip: { margin: 4 },
};

 /*
clientContactName
clientContactPhone
clientContactIdent
 */

const SegmentsFieldContactInf = ({ record, translate }) => {
    //console.log(record);
    return (
      <span style={styles.main}>
        <Chip style={styles.chip}>
          {record.clientContactAddress.name}
        </Chip>
        <Chip style={styles.chip}>
          {record.clientContactAddress.tel}
        </Chip>
      </span>
    );
};

const TranslatedSegmentsField = translate(SegmentsFieldContactInf);

TranslatedSegmentsField.defaultProps = {
  addLabel: true,
  source: 'contactInf',
};

export default TranslatedSegmentsField;
