import {categoriesTypes} from '@utils/categories';

export interface AudioData {
  id: string;
  title: string;
  about: string;
  category: categoriesTypes;
  file: string;
  poster?: string;
  owner: {
    id: string;
    name: string;
  };
}

export interface Playlist {
  id: string;
  title: string;
  itemCounts: number;
  visibility: 'public' | 'private';
}