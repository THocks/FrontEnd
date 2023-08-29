'use client'

/* eslint-disable import/no-extraneous-dependencies */
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Grid, Card, Stack, Typography, MenuItem, Divider } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Dayjs } from 'dayjs';
import { cpfMask,phoneMask,cepMask } from '@/services/regex-masks';
import fetchZipcode from '@/services/fetchZipcode';
import { saveClient,uploadImage } from '@/redux/slices/client';
import { useDispatch,useSelector } from 'react-redux';
import { CITIES } from '@/constants/citiets';
import { STATES } from '@/constants/states';
import { IUserModel } from '@/types/user/types';
import { setFormattedDate } from '@/services/setFormattedDate';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContextFirebase';
// utils
import FormProvider from '@/services/hook-form/FormProvider';
import RHFTextField from '@/services/hook-form/RHFTextField';
import { RHFUploadAvatar } from '@/services/hook-form/RHFUploadAvatar';

// ----------------------------------------------------------------------

type FormValuesProps = IUserModel;

export default function AccountGeneral() {

  //@ts-ignore
  const { user, initialize } = useContext(AuthContext);
  const dispatch = useDispatch();
  const { profileImage } = useSelector((state: any) => state.client);

  const [citiesByStates, setCities] = useState<string[]>([]);
  const [userBirth, setBirthday] = useState<string | null>(null);
  const [photoURL, setPhotoURL] = useState<string>(user?.photoURL || '');

  const MyUserSchema = Yup.object().shape({
    firstName: Yup.string().required('Nome é obrigatorio'),
    lastName: Yup.string().required('Sobrenome é obrigatorio'),
    email: Yup.string().required('Email é obrigatorio').email('Email ser em um formato válido'),
    phoneNumber: Yup.string().required('Telefone é obrigatorio'),
    cpf: Yup.string()
      .required('CPF é obrigatorio')
      .min(14, 'CPF precisa ter pelo menos 11 caracteres'),
    birthday: Yup.string().required('Data de nascimento é obrigatoria'),
    address: Yup.object().shape({
      zipcode: Yup.string().required('CEP é obrigatorio'),
      street: Yup.string().required('Endereço é obrigatorio'),
      number: Yup.number().required('Numero é obrigatorio'),
      state: Yup.string().required('Estado é obrigatorio'),
      city: Yup.string().required('Cidade é obrigatorio'),
      district: Yup.string().required('Bairro é obrigatorio'),
    }),
  });

  const defaultValues = useMemo(
    () => ({
      uid: user?.uid,
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email?.toLowerCase() || '',
      phoneNumber: user?.phoneNumber || '',
      createdAt: user?.createdAt || new Date().toISOString(),
      cpf: user?.cpf || '',
      photoURL,
      address: {
        zipcode: user?.address?.zipcode || '',
        street: user?.address?.street || '',
        number: user?.address?.number || undefined,
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        country: user?.address?.country || 'Brazil',
        complement: user?.address?.complement || '',
        district: user?.address?.district || '',
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  );

  const methods = useForm<FormValuesProps>({
    //@ts-ignore
    resolver: yupResolver(MyUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('photoURL', newFile, { shouldValidate: true });
         //@ts-ignore
        dispatch(uploadImage(file, user?.uid));
      }
    },
    [dispatch, setValue, user]
  );

  useEffect(() => {
    if (profileImage.imageUrl) {
      setValue('photoURL', profileImage.imageUrl, { shouldValidate: true });
      setPhotoURL(profileImage.imageUrl);
    }
  }, [profileImage, setValue]);

  useEffect(() => {
    if (user) {
      reset(defaultValues);
      if (user?.birthday) {
        setValue('birthday', setFormattedDate(user?.birthday), { shouldDirty: false });
        setBirthday(setFormattedDate(user?.birthday));
      }
      if (user?.address?.state) {
        setCities(CITIES.find((state) => state.UF === user.address.state)?.cities || []);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onSubmit = async (data: FormValuesProps) => {
    const body = {
      ...data,
      email: data?.email?.toLowerCase(),
    };
    try {
      if (user?.uid) {

        //@ts-ignore
        await dispatch(saveClient(user?.uid, body));
        if (initialize) {
          await initialize();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onBlurZipcode = async (e: any) => {
    setValue('address.zipcode', cepMask(e.target.value), { shouldDirty: true, shouldTouch: true });

    // SETUP THE REST OF FIELDS BASED IN THE CEP
    const address = await fetchZipcode(e.target.value);
    if (address.zipcode) {
      const fieldOption = { shouldDirty: true, shouldTouch: true };
      setValue('address.street', address.street, fieldOption);
      setValue('address.state', address.state, fieldOption);
      setValue('address.district', address.district, fieldOption);
      if (address.state) {
        setCities(CITIES.find((state) => state.UF === address.state)?.cities || []);
        setValue('address.city', address.city, fieldOption);
      }
    }
  };

  const setState = (e: any) => {
    setValue('address.state', e.target.value, { shouldDirty: true, shouldTouch: true });
    setCities(CITIES.find((state) => state.UF === e.target.value)?.cities || []);
  };

  const handleStartDateChange = (newValue: Dayjs | null) => {
    setValue('birthday', setFormattedDate(newValue), { shouldDirty: true });
    setBirthday(setFormattedDate(newValue));
  };

  const onChangeCPF = (e: any) => {
    setValue('cpf', cpfMask(e.target.value), { shouldDirty: true });
  };

  const onChangePhone = (e: any) => {
    setValue('phoneNumber', phoneMask(e.target.value), { shouldDirty: true });
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ py: 10, px: 3, textAlign: 'center' }}>
            <RHFUploadAvatar
              name="photoURL"
              maxSize={3145728}
              onDrop={handleDrop}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 2,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.secondary',
                  }}
                >
                  Permitido *.jpeg, *.jpg, *.png,
                  <br /> max size of 15mb
                </Typography>
              }
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              mb={3}
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="firstName" label="Nome" />
              <RHFTextField name="lastName" label="Sobrenome" />

              <RHFTextField
                name="phoneNumber"
                label="Telefone celular"
                onChange={onChangePhone}
                inputProps={{ maxLength: 15 }}
              />
              <RHFTextField name="cpf" label="CPF" onChange={onChangeCPF} />


              <RHFTextField name="email" label="Email" disabled />
          
            </Box>
            <Divider />

            <Typography mt={2} color="#535353">
              Endereço
            </Typography>
            <Box
              mt={3}
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(3, 1fr)',
              }}
            >
              <RHFTextField
                name="address.zipcode"
                label="CEP"
                onBlur={onBlurZipcode}
                onChange={onBlurZipcode}
                inputProps={{ maxLength: 9 }}
              />
              <RHFTextField name="address.street" label="Endereço" />
              <RHFTextField name="address.number" label="Número" />
              <RHFTextField name="address.district" label="Bairro" />
              <RHFTextField name="address.state" label="Estado" select onChange={setState}>
                {STATES.map((option) => (
                  <MenuItem key={option.UF} value={option.UF}>
                    {option.name}
                  </MenuItem>
                ))}
              </RHFTextField>
              <RHFTextField name="address.city" label="Cidade" select>
                {citiesByStates?.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </RHFTextField>
            </Box>
            <Box mt={2}>
              <RHFTextField name="address.complement" label="Complemento" />
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Salvar mudanças
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}