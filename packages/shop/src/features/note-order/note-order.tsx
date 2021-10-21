import { CardHeader } from "components/card-header/card-header";
import { useCart } from "contexts/cart/use-cart";
import { useRef, useState } from "react";
import { FormattedMessage } from "react-intl";

const NoteOrder = ({
  increment = false,
}) => {
  const {
    note,
    noteOrder,
  } = useCart();
  const [value, setValue] = useState(note);

  const handleBlur = () => {
    noteOrder(value);
  }

  return (
    <>
      <CardHeader increment={increment}>
        <FormattedMessage id="note" defaultMessage="Note" />
      </CardHeader>
      <textarea value={value} rows={4} style={{ width: '100%' }}
        onChange={(e) => setValue(e.target.value)} onBlur={handleBlur} />
    </>
  );
};

export default NoteOrder;
