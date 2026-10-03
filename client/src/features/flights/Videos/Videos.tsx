import { useState, useEffect } from "react";
import { getApi } from "../../../utils/api-facade";
import { formatDate } from "../../../utils/date";

import css from "./Videos.module.css";

interface IVideosProps {
  date: Date;
  plane?: string;
  session?: string | number;
}

const getVideoTitle = (url: string) => url.substring(url.lastIndexOf("/") + 1);

export const Videos = ({ date, plane, session }: IVideosProps) => {
  const [videos, setVideos] = useState<string[]>();

  const params = {
    date: formatDate(date),
    plane,
    session,
  };

  useEffect(() => {
    getApi<string[]>("videos", params).then(setVideos);
  }, []);

  if (!videos) {
    return <></>;
  }

  return (
    <>
      {videos.map((video) => (
        <div key={video} className={css.videoContainer}>
          <div className={css.overlay}>
            <h1>{getVideoTitle(video)}</h1>
          </div>
          <video src={video} controls className={css.video}>
            Your browser does not support the video tag.
          </video>
        </div>
      ))}
    </>
  );
};
