import * as React from 'react';

import { Player, ControlBar, BigPlayButton } from 'video-react';
import { formatDate } from '../../../../shared/utils/date';
import { getApi } from '../../../utils/api-facade';
import { useState, useEffect } from 'react';

const css = require('./Videos.css');

interface IVideosProps {
  date: Date;
  plane?: string;
  session?: number;
}

const Overlay = ({ url }: { url: string }) => {
  const title = url.substr(url.lastIndexOf('/') + 1);

  return (
    <div className={css.overlay}>
      <h1>{title}</h1>
    </div>
  );
}

export const Videos = ({ date, plane, session }: IVideosProps) => {

  const [videos, setVideos] = useState([]);

  const params = {
    date: formatDate(date),
    plane,
    session
  };

  useEffect(() => {
    getApi('videos', params).then(setVideos);
  }, []);

  if (!videos) {
    return <></>;
  }

  return (<>{videos.map(video => (
    <Player key={video} src={video}>
      <ControlBar autoHide={true} />
      <BigPlayButton position='center' />
      <Overlay url={video} />
    </Player>
  ))}</>);
}