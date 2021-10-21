import React, { useContext } from 'react';
import SignInForm from './login';
import SignOutForm from './register';
import ForgotPassForm from './forgot-password';
import { CustomerContext } from 'contexts/customer/customer.context';

export default function AuthenticationForm() {
  const { customerState } = useContext<any>(CustomerContext);
  let RenderForm;
  RenderForm = SignInForm;
  return <RenderForm />;
}
