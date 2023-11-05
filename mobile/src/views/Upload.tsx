import CategorySelector from '@components/CategorySelector';
import FileSelector from '@components/FileSelector';
import client from '@src/api/client';
import AppButton from '@ui/AppButton';
import Progess from '@ui/Progess';
import {Keys, getFromAsyncStorage} from '@utils/asyncStorage';
import {categories} from '@utils/categories';
import colors from '@utils/colors';
import {mapRange} from '@utils/math';
import React, {FC, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {DocumentPickerResponse, types} from 'react-native-document-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as yup from 'yup';

interface FormFields {
  title: string;
  category: string;
  about: string;
  file?: DocumentPickerResponse;
  poster?: DocumentPickerResponse;
}

const defaultForm: FormFields = {
  title: '',
  category: '',
  about: '',
  file: undefined,
  poster: undefined,
};

const audioInfoSchema = yup.object().shape({
  title: yup.string().trim().required('Title is missing!'),
  category: yup.string().oneOf(categories, 'Category is missing!'),
  about: yup.string().trim().required('About is missing!'),
  file: yup.object().shape({
    uri: yup.string().trim().required('Audio file is missing!'),
    name: yup.string().trim().required('Audio file is missing!'),
    type: yup.string().trim().required('Audio file is missing!'),
    size: yup.number().required('Audio file is missing!'),
  }),
  poster: yup.object().shape({
    uri: yup.string(),
    name: yup.string(),
    type: yup.string(),
    size: yup.number(),
  }),
});

interface Props {}

const Upload: FC<Props> = props => {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [audioInfo, setAudioInfo] = useState({...defaultForm});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [busy, setBusy] = useState(false);

  const handleUpload = async () => {
    setBusy(true);
    try {
      const finalData = await audioInfoSchema.validate(audioInfo);

      const formData = new FormData();

      formData.append('title', finalData.title);
      formData.append('category', finalData.category);
      formData.append('about', finalData.about);
      formData.append('file', {
        uri: finalData.file?.uri,
        name: finalData.file?.name,
        type: finalData.file?.type,
      });
      if (finalData.poster.uri) {
        formData.append('poster', {
          uri: finalData.poster?.uri,
          name: finalData.poster?.name,
          type: finalData.poster?.type,
        });
      }

      const token = await getFromAsyncStorage(Keys.AUTH_TOKEN);

      const {data} = await client.post('/audio/create/', formData, {
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'multipart/form-data;',
        },
        onUploadProgress(progressEvent) {
          const uploaded = mapRange({
            inputMin: 0,
            inputMax: progressEvent.total || 0,
            outputMin: 0,
            outputMax: 100,
            inputValue: progressEvent.loaded,
          });

          if (uploaded >= 100) {
            setAudioInfo({...defaultForm});
            setBusy(false);
          }

          setUploadProgress(Math.floor(uploaded));
        },
      });
      console.log(data);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        console.log(error.message);
      } else console.log(error?.response?.data);
    }
    setBusy(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.fileSelectorContainer}>
        <FileSelector
          icon={
            <MaterialCommunityIcons
              name="image-outline"
              size={35}
              color={colors.SECONDARY}
            />
          }
          btnTitle="Select Poster"
          options={{type: [types.images]}}
          onSelect={file => setAudioInfo({...audioInfo, poster: file})}
        />
        <FileSelector
          icon={
            <MaterialCommunityIcons
              name="file-music-outline"
              size={35}
              color={colors.SECONDARY}
            />
          }
          btnTitle="Select Audio"
          style={{marginLeft: 20}}
          options={{type: [types.audio]}}
          onSelect={file => setAudioInfo({...audioInfo, file: file})}
        />
      </View>
      <View style={styles.formContainer}>
        <TextInput
          placeholder="Title"
          style={styles.input}
          placeholderTextColor={colors.INACTIVE_CONTRAST}
          onChangeText={text => setAudioInfo({...audioInfo, title: text})}
          value={audioInfo.title}
        />
        <Pressable
          onPress={() => setShowCategoryModal(true)}
          style={styles.categorySelector}>
          <Text style={styles.categorySelectorTitle}>Category</Text>
          <Text style={styles.selectedCategory}>{audioInfo.category}</Text>
        </Pressable>
        <TextInput
          placeholder="About"
          style={styles.input}
          placeholderTextColor={colors.INACTIVE_CONTRAST}
          multiline
          numberOfLines={10}
          textAlignVertical="top"
          onChangeText={text => setAudioInfo({...audioInfo, about: text})}
          value={audioInfo.about}
        />
      </View>
      <View style={{marginVertical: 20}}>
        {busy ? <Progess progress={uploadProgress} /> : null}
      </View>
      <AppButton
        busy={busy}
        title="Submit"
        borderRadius={7}
        onPress={handleUpload}
      />
      <CategorySelector
        visible={showCategoryModal}
        title="Category"
        data={categories}
        renderItem={item => {
          return <Text style={styles.category}>{item}</Text>;
        }}
        onSelect={(data, index) => setAudioInfo({...audioInfo, category: data})}
        onRequestClose={() => setShowCategoryModal(false)}
      />
    </ScrollView>
  );
};

export default Upload;

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  fileSelectorContainer: {
    flexDirection: 'row',
  },
  formContainer: {
    marginTop: 20,
  },
  input: {
    borderRadius: 7,
    borderColor: colors.SECONDARY,
    borderWidth: 1,
    padding: 10,
    fontSize: 18,
    color: colors.CONTRAST,
  },
  category: {
    color: colors.PRIMARY,
    padding: 10,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  categorySelectorTitle: {
    color: colors.CONTRAST,
  },
  selectedCategory: {
    color: colors.SECONDARY,
    marginLeft: 5,
    fontStyle: 'italic',
  },
});
