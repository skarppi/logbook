import * as React from "react";
import { RootState } from "../../../app";
import { fetchVideos } from "../actions";
import { connect } from "react-redux";

import { Player, ControlBar, BigPlayButton } from "video-react";
import { formatDate } from "../../../../shared/utils/date";

const css = require("./Videos.css");

interface OwnProps {
  date: Date;
  plane?: string;
  session?: number;
}

interface VideoProps {
  videos: string[];
}

type AllProps = VideoProps & typeof mapDispatchToProps & OwnProps;

interface OverlayProps {
  title: string;
}

class Overlay extends React.Component<OverlayProps> {
  private title: string;

  constructor(props) {
    super(props);
    this.title = props.title.substr(props.title.lastIndexOf("/") + 1);
  }

  render() {
    return (
      <div className={css.overlay}>
        <h1>{this.title}</h1>
      </div>
    );
  }
}

class Videos extends React.Component<AllProps> {
  render() {
    const { videos } = this.props;

    if (!videos) {
      return <></>;
    }

    return videos.map(video => (
      <Player key={video} src={video}>
        <ControlBar autoHide={true} />
        <BigPlayButton position="center" />
        <Overlay title={video} />
      </Player>
    ));
  }

  async componentWillMount() {
    const { date, plane, session } = this.props;
    this.props.fetchVideos({
      date: formatDate(date),
      plane: plane,
      session: session
    });
  }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  videos: state.flights.videos
});

const mapDispatchToProps = {
  fetchVideos: fetchVideos.request
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Videos);
