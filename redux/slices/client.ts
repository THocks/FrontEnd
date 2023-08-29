import { createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {
  doc,
  updateDoc,

} from 'firebase/firestore';
import { IUserModel } from '@/types/user/types';
import { getDB, storage } from '@/context/AuthContextFirebase';


const initialState: any = {
  isLoading: false,
  error: null,
  clientData: {} as IUserModel,
  profileImage: {},
  dataGrid: {
    rows: [] as IUserModel[],
  },
};

const slice = createSlice({
  name: 'client',
  initialState,
  reducers: {
   
    saveUser(state) {
      state.isLoading = true;
      state.error = false;
    },
    saveClientSuccess(state) {
      state.isLoading = false;
      state.error = false;
    },
    saveClientError(state) {
      state.isLoading = false;
      state.error = true;
    },
    profileImageUpload(state, action: PayloadAction<any>) {
      state.isLoading = true;
      state.profileImage = action.payload;
    },
    
  },
});

// Reduce
export default slice.reducer;



export function uploadImage(file: File, uid: string) {
  return async (dispatch: Dispatch) => {
    try {
      if (file) {
        const extention = file.type.split('/')[1];
        const storageRef = ref(storage, `/users/profile/${uid}.${extention}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100); 
            dispatch(slice.actions.profileImageUpload({ percent, imageUrl: null }));
          },
          (err) => console.log(err),
          () =>
            getDownloadURL(uploadTask.snapshot.ref).then((url) => {
              dispatch(slice.actions.profileImageUpload({ percent: 100, imageUrl: url }));
            })
        );
      }
    } catch (error) {
      console.warn(error);
    }
  };
}

export function saveClient(id: string, body: IUserModel) {
  return async (dispatch: Dispatch) => {
    dispatch(slice.actions.saveUser());
    try {
      await updateDoc(doc(getDB, 'users', id), body as { [x: string]: any });
      dispatch(slice.actions.saveClientSuccess());
    } catch (error) {
      console.warn(error);
    }
  };
}







