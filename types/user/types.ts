
export interface IUserModel {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  cpf: string;
  birthday: string | Date | null;
  photoURL?: string | File;
  address: IUserAddressModel;
}

export interface IUserAddressModel {
  zipcode: string;
  street: string;
  number: string;
  city: string;
  state: string;
  country: string;
  complement?: string;
  district: string;
}
