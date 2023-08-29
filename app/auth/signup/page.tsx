'use client';
// hooks
import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
// Libs
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Stack, IconButton, InputAdornment, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// Msk
import { phoneMask } from '@/services/regex-masks';
// services
import RHFTextField from '@/services/hook-form/RHFTextField';
import FormProvider from '@/services/hook-form/FormProvider';
import Iconify from '@/services/iconify/Iconify';
// Context
import { AuthContext } from '@/context/AuthContextFirebase';
// Components
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
// ----------------------------------------------------------------------

type FormValuesProps = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  afterSubmit?: string;
};

export default function AuthRegisterForm() {
  const router = useRouter();
  //@ts-ignore
  const { register, isAuthenticated } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required('Nome é obrigatório'),
    lastName: Yup.string().required('Sobrenome obrigatório'),
    phoneNumber: Yup.string().required('Número de telefone é obrigatório'),
    email: Yup.string()
      .required('Email é obrigatório')
      .email('Email precisa ser um email válido'),
    password: Yup.string().required('Senha é obrigatória'),
  });

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [router, isAuthenticated]);

  const onSubmit = async (data: FormValuesProps) => {
    try {
      if (register) {
        await register(
          data?.email?.toLowerCase(),
          data.password,
          data.firstName,
          data.lastName,
          data.phoneNumber,
        );
      }
    } catch (error: any) {
      console.error(error);
      reset();
      setError('afterSubmit', {
        ...error,
        message: error.message || error,
      });
    }
  };

  const onChangePhone = (e: any) => {
    setValue('phoneNumber', phoneMask(e.target.value), { shouldDirty: true });
  };

  return (
    <>
      <Breadcrumb pageName="Cadastre-se" />
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2.5}>
          {!!errors.afterSubmit && (
            <Alert severity="error">{errors.afterSubmit.message}</Alert>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <RHFTextField name="firstName" label="Nome" />
            <RHFTextField name="lastName" label="Sobrenome" />
          </Stack>

          <RHFTextField name="email" label="Email" />
          <RHFTextField
            name="phoneNumber"
            label="Telefone celular"
            onChange={onChangePhone}
            inputProps={{ maxLength: 15 }}
          />
          <RHFTextField
            name="password"
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    <Iconify
                      icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <LoadingButton
            fullWidth
            color="inherit"
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitSuccessful || isSubmitting}
            sx={{
              bgcolor: 'text.primary',
            }}
          >
            Criar minha conta
          </LoadingButton>
        </Stack>
      </FormProvider>
    </>
  );
}
