import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { DialogActions, DialogContent, DialogTitle, IconButton, Icon, TextField, MenuItem, Checkbox, Button, Switch } from '@material-ui/core';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { showErrorMessage } from 'app/store/fuse/messageSlice';
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
const NEXT_PUBLIC_STRIPE_PUBLIC_KEY = 'pk_test_51J3CJLL0hkI6RHljd0yW5Esl0kDI28MqaVKVD42LxFqSDDovlzdZMuo9vqh1Z39wTH7TlpiVl2HJ69YhS6racUHF00Jnuyh3Z7';
const stripePromise = loadStripe(NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const StripeForm = ({ buttonText, getToken, showErrorMessage }) => {
  // Get a reference to Stripe or Elements using hooks.
  const stripe = useStripe();
  const elements = useElements();
  const handleSubmit = async () => {
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }
    // Use elements.getElement to get a reference to the mounted Element.
    const cardElement = elements.getElement(CardElement);

    // Pass the Element directly to other Stripe.js methods:
    // e.g. createToken - https://stripe.com/docs/js/tokens_sources/create_token?type=cardElement
    const { error, token } = await stripe.createToken(cardElement);
    console.log({ error, token });
    if (error) {
      showErrorMessage(error.message);
    } else {
      // getToken(token);
      return token;
    }
  };
  return (
    <div style={{
      width: '500px',
      height: '170px'
    }}>
      <DialogTitle>Enter card info</DialogTitle>
      <DialogContent>
        <CardElement />
      </DialogContent>
      <DialogActions>
        <div className="flex justify-around m-10">
          <Button onClick={handleSubmit} color="primary">Indsend</Button>
        </div>
      </DialogActions>
    </div>
  );
};

const StripePaymentForm = ({ price, buttonText, showErrorMessage }) => {
  const sendTokenToServer = async (token) => {
    // const payment_info = await getPayment({
    //   variables: { paymentInput: JSON.stringify({ token, amount: price }) },
    // });
    console.log(token);
  };

  return (
    <div style={{ width: '500px' }}>
      <Elements stripe={stripePromise}>
        <StripeForm
          getToken={(token) => sendTokenToServer(token)}
          buttonText={buttonText}
          showErrorMessage={showErrorMessage}
        />
      </Elements>
    </div>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      showErrorMessage,
    },
    dispatch
  );
}


export default connect(null, mapDispatchToProps)(StripePaymentForm);