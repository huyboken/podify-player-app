import {useFetchPlaylist} from 'src/hooks/query';
import AudioListLoadingUI from '@ui/AudioListLoadingUI';
import EmptyRecords from '@ui/EmptyRecords';
import PlaylistItem from '@ui/PlaylistItem';
import React, {FC} from 'react';
import {StyleSheet, ScrollView} from 'react-native';
import {Playlist} from 'src/@types/audio';
import {useDispatch} from 'react-redux';
import {
  updatePlaylistVisibility,
  updateSelectedList,
} from 'src/store/playlistModal';

interface Props {}

const PlaylistTab: FC<Props> = props => {
  const dispatch = useDispatch();
  const {data, isLoading} = useFetchPlaylist();

  const handleOnListPress = (playlist: Playlist) => {
    dispatch(updateSelectedList(playlist.id));
    dispatch(updatePlaylistVisibility(true));
  };

  if (isLoading) return <AudioListLoadingUI />;

  return (
    <ScrollView style={styles.container}>
      {!data?.length && <EmptyRecords title="There is no playlist audio!" />}
      {data?.map(playlist => {
        return (
          <PlaylistItem
            onPress={() => handleOnListPress(playlist)}
            playlist={playlist}
            key={playlist.id}
          />
        );
      })}
    </ScrollView>
  );
};

export default PlaylistTab;

const styles = StyleSheet.create({
  container: {},
});
