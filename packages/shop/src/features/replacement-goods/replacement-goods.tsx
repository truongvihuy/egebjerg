
import React, { useContext, useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import YesNoOptions from 'features/yes-no-options/yes-no-options';
import { FormattedMessage } from 'react-intl';
import { GET_SETTING } from 'graphql/query/setting.query';
import { CustomerContext } from 'contexts/customer/customer.context';
import { REPLACEMENT_GOODS_EXPLAINATION } from 'config/constant';
import { initializeApollo } from 'utils/apollo';
import { UPDATE_ME } from 'graphql/mutation/me';
import { CardHeader } from 'components/card-header/card-header';

const replacementGoods = ({ increment = false }) => {
  const { customerState, customerDispatch } = useContext<any>(CustomerContext);
  const [settingMap, setSettingMap] = useState<any>({});
  const [updateMeMutation] = useMutation(UPDATE_ME);

  useEffect(() => {
    (async () => {
      const apolloClient = initializeApollo();
      const { data } = await apolloClient.query({
        query: GET_SETTING
      });
      let newSettingMap: any = {};
      data.settings.forEach(x => {
        let setting = { ...x };
        if (setting.value.startsWith('{') && setting.value.endsWith('}')) {
          setting.value = JSON.parse(setting.value);
        }
        newSettingMap[setting.key] = setting;
      });
      setSettingMap(newSettingMap);
    })();
  }, []);

  const handleChangeReplaceMentGoods = (field, value) => {
    let newValue = (field == 'ordinary' && value == true) ? {
      ...customerState.replacement_goods,
      "ordinary": true,
      "milk_and_bread": true,
    } : {
      ...customerState.replacement_goods,
      [field]: value
    };
    updateMeMutation(
      {
        variables: {
          meInput: (field == 'ordinary' && value == true) ? JSON.stringify({
            replacement_goods: newValue
          }) : JSON.stringify({
            replacement_goods: newValue
          })
        }
      }
    ).then((response) => {
      if (response.data) {
        customerDispatch({
          type: 'HANDLE_ON_INPUT_CHANGE',
          payload: {
            field: 'replacement_goods',
            value: newValue,
          },
        });
      }
    });
  }

  return (
    <>
      <CardHeader increment={increment}>
        <FormattedMessage
          id="replacementGoodsTitle"
          defaultMessage="Do you want replacement goods?"
        />
      </CardHeader>
      <YesNoOptions titleId='replacementGoodsTitle' infoText={settingMap.replacement_normal_goods_info_text?.value ?? REPLACEMENT_GOODS_EXPLAINATION} title={settingMap.replacement_normal_goods_info_text?.name ?? null}
        flag={customerState.replacement_goods?.ordinary} handleChangeOption={(value) => handleChangeReplaceMentGoods('ordinary', value)} />
      {
        customerState.replacement_goods?.ordinary ? null : (
          <>
            <YesNoOptions titleId='replacementGoodsTitle' infoText={settingMap.replacement_milk_and_bread_info_text?.value ?? REPLACEMENT_GOODS_EXPLAINATION} title={settingMap.replacement_milk_and_bread_info_text?.name ?? null}
              flag={customerState.replacement_goods?.milk_and_bread} handleChangeOption={(value) => handleChangeReplaceMentGoods('milk_and_bread', value)} />
          </>
        )
      }
      <YesNoOptions titleId='replacementGoodsTitle' infoText={settingMap.replacement_promotional_goods_info_text?.value ?? REPLACEMENT_GOODS_EXPLAINATION} title={settingMap.replacement_promotional_goods_info_text?.name ?? null}
        flag={customerState.replacement_goods?.promotion} handleChangeOption={(value) => handleChangeReplaceMentGoods('promotion', value)} />
    </>
  )
}

export default replacementGoods;