import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { themeGet } from '@styled-system/theme-get';
import * as Yup from 'yup';
import { closeModal } from '@redq/reuse-modal';
import { FormikProps, ErrorMessage, Formik, Form } from 'formik';
import { ApolloError, useMutation } from '@apollo/client';
import { Input } from '../forms/input';
import { CustomerContext } from 'contexts/customer/customer.context';
import { Button } from 'components/button/button';
import { UPDATE_ME, UPDATE_PASSWORD } from 'graphql/mutation/me';
import { StyledFieldWrapper, StyledHeading, StyledButton } from './single-field-form.style';
import { View } from 'assets/icons/View';

type Props = {
  title?: string,
  field: string,
  value?: string,
};
// Shape of form values
type FormValues = {
  value?: string;
  oldPassword?: string;
};

const validationSchema = {
  'membership_number': Yup.object().shape({
    value: Yup.string().matches(/^\d+$/, 'Indtast nummeret').required('Påkrævet medlemsnummer'),
  }),
  // 'name': Yup.object().shape({
  //   value: Yup.string().required('Navn påkrævet'),
  // }),
  'email': Yup.object().shape({
    value: Yup.string().email('E-mail-format er ikke korrekt').required('E-mail påkrævet'),
  }),
  'password': Yup.object().shape({
    value: Yup.string().required('Adgangskoden kan ikke være tom'),
    oldPassword: Yup.string().required('Gammel adgangskode kan ikke efterlades tom'),
  }),
}

const placeholder = {
  membership_number: 'Medlemskortnummer',
  email: 'Email',
  password: 'Ny adgangskode',
  oldPassword: 'Gammel adgangskode'
}

const inputType = {
  membership_number: 'number',
}

const ModalCreateOrUpdateProfile: React.FC<Props> = ({ title, field, value }) => {
  const initialValues = {
    value: value || '',
  };

  const [updateMeMutation] = useMutation(UPDATE_ME);
  const [updatePasswordMutation] = useMutation(UPDATE_PASSWORD);
  const { customerState, customerDispatch } = useContext<any>(CustomerContext);
  const [displayPassWord, setDisplayPassWord] = useState({ password: false, oldPassword: false });
  const handleSubmit = async (values: FormValues, { setErrors, setSubmitting }: any) => {
    switch (field) {
      case 'password': {
        await updatePasswordMutation(
          {
            variables: {
              password: values.value,
              oldPassword: values.oldPassword,
            }
          }
        ).then(() => {
          closeModal();
          setSubmitting(false);
        }).catch((e: ApolloError) => {
          if (e.graphQLErrors[0].extensions.code === 'WRONG_PASSWORD')
            setErrors({ value: 'Forkert kodeord' });
          else setErrors({ value: e.message });
        });
        break;
      }
      default: {
        await updateMeMutation(
          {
            variables: { meInput: JSON.stringify({ [field]: `${values.value}` }) }
          }
        ).then(() => {
          closeModal();
          setSubmitting(false);
          customerDispatch({ type: 'HANDLE_ON_INPUT_CHANGE', payload: { value: `${values.value}`, field }, });
        }).catch(e => setErrors({ value: e.message }));
      }
    }
  };
  const handleShowPassword = (field) => {
    setDisplayPassWord({ ...displayPassWord, [field]: !displayPassWord[field] });
  }
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema[field]}
    >
      {({
        values,
        handleChange,
        handleBlur,
        isSubmitting,
      }: FormikProps<FormValues>) => (
        <Form>
          <StyledHeading>
            {title ? title : 'Rediger oplysninger'}
          </StyledHeading>
          {field === 'password' && (
            <>
              <StyledFieldWrapper>
                <Input
                  className="form-control"
                  placeholder={placeholder['oldPassword']}
                  guide={false}
                  value={values.oldPassword ?? ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name='oldPassword'
                  type={!displayPassWord.oldPassword ? 'password' : 'text'}
                  render={(ref: any, props: {}) => (
                    <StyledInput ref={ref} {...props} />
                  )}
                />
                <StyledButton onClick={() => handleShowPassword('oldPassword')}><View active={displayPassWord.oldPassword} /></StyledButton>
              </StyledFieldWrapper>
              <ErrorMessage name='oldPassword' component={StyledError} />
            </>)}
          <StyledFieldWrapper>
            <Input
              className="form-control"
              placeholder={placeholder[field]}
              guide={false}
              value={values.value}
              onChange={handleChange}
              onBlur={handleBlur}
              name="value"
              type={
                field === 'password'
                  ? (!displayPassWord.password ? 'password' : 'text')
                  : (inputType[field] ? inputType[field] : 'text')
              }
              render={(ref: any, props: {}) => (
                <StyledInput ref={ref} {...props} />
              )}
            />
            {field === 'password' &&
              <StyledButton onClick={() => handleShowPassword('password')}><View active={displayPassWord.password} /></StyledButton>}
          </StyledFieldWrapper>
          <ErrorMessage name="value" component={StyledError} />

          <Button
            disabled={isSubmitting}
            type="submit"
            style={{ width: '100%', height: '44px' }}
          >
            Gem oplysninger
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default ModalCreateOrUpdateProfile;

const StyledInput = styled.input`
  width: 100%;
  height: 54px;
  border-radius: ${themeGet('radii.base', '6px')};
  font-family: ${themeGet('fonts.body', 'Lato, sans-serif')};
  border: 1px solid ${themeGet('colors.gray.700', '#e6e6e6')};
  color: ${themeGet('colors.text.bold', '#0D1136')};
  font-size: 16px;
  line-height: 19px;
  font-weight: ${themeGet('fontWeights.regular', '400')};
  padding: 0 18px;
  box-sizing: border-box;
  transition: border-color 0.25s ease;

  &:hover,
  &:focus {
    outline: 0;
  }

  &:focus {
    border-color: ${themeGet('colors.primary.regular', '#009e7f')};
  }

  &::placeholder {
    color: ${themeGet('colors.text.regular', '#77798C')};
  }
`;

const StyledError = styled.div`
  color: red;
  padding-bottom: 10px;
  margin-top: -5px;
`;
