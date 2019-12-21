import React, { Component } from "react";
import FeaturePDV from "./FeaturePDV";
import axios from "axios";
import { BrowserRouter as Router, Link } from "react-router-dom";
import config from '../config';

class ProjectDetailView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      features: [],
      name: "",
      comments: "",
      projectId: ""
    };
  }
  render() {
    return (
      <div className="container">
        <h1>{this.state.name}</h1>
        {this.state.features.map(feature => (
          <FeaturePDV
            featureId={feature._id}
            count={feature.voteCount}
            title={feature.headline}
            description={feature.description}
            commentCount={0}
            projectId={this.state.projectId}
          />
        ))}
      </div>
    );
  }
  async componentDidMount() {
    const promise = await axios.get(
      config.url + `/api/projects/` + this.props.match.params._id
    );
    const features = promise.data.features;
    const name = promise.data.name;
    const _id = promise.data._id;
    this.setState({ features });
    this.setState({ name });
    this.setState({ projectId: _id});
    console.log(_id);
  }
}
export default ProjectDetailView;