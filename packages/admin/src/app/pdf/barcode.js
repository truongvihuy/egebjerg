import { Image, Text } from '@react-pdf/renderer';
import { drawBarCode } from 'app/helper/barcode.helper';


export const Barcode = ({ style, barcode }) => {
  try {
    return barcode && `${barcode}`.length === 13 ? (
      <Image style={style} src={drawBarCode(`${barcode}`)} />
    ) : <Text>{barcode}</Text>;
  } catch (e) {
    console.error('barcode error', barcode)
    return <Text>{barcode}</Text>;
  }
};