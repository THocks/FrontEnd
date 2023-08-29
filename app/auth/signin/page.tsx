'use client';

import { useState, useEffect } from 'react';
import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Link, Stack, Alert, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// routes
import { FIREBASE_ERRORS } from '@/services/firebaseErros';
// auth
// components
import Iconify from '@/services/iconify/Iconify';
import FormProvider from '@/services/hook-form/FormProvider';
import RHFTextField from '@/services/hook-form/RHFTextField';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContextFirebase';
import { useRouter } from 'next/navigation';

// ----------------------------------------------------------------------

type FormValuesProps = {
  email: string;
  password: string;
  afterSubmit?: string;
};

export default function AuthLoginForm() {
  //@ts-ignore
  const { login, isAuthenticated } = useContext(AuthContext);
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .required('Email é obrigattório')
      .email('O e-mail deve ser um endereço de e-mail válido'),
    password: Yup.string().required('Senha é obrigattório'),
  });

  const defaultValues = {
    email: '',
    password: '',
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    setLoading(true);
    try {
      await login(data.email?.toLowerCase(), data.password);
    } catch (error: any) {
      const message =
        (FIREBASE_ERRORS as any)?.[error?.code] ||
        'Erro ao tentar realizar o login';
      console.error(error);
      reset();
      setError('afterSubmit', {
        ...error,
        message: message || error,
      });
    }
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [router, isAuthenticated]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {!!errors.afterSubmit && (
          <Alert severity="error">{errors.afterSubmit.message}</Alert>
        )}

        <RHFTextField name="email" label="Email" />

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
      </Stack>
      <div className="mt-5">
        <LoadingButton
          fullWidth
          color="inherit"
          size="large"
          type="submit"
          disabled={isLoading}
          variant="contained"
          loading={isLoading}
          sx={{
            bgcolor: 'text.primary',
          }}
        >
          Login
        </LoadingButton>
      </div>
    </FormProvider>
  );
}
