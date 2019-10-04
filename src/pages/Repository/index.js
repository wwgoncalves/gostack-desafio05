import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

import api from "../../services/api";
import Container from "../../components/Container";
import { Loading, Owner, IssueList, FilterAndPagination } from "./styles";

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    issuesState: "open",
    currentPage: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  async componentDidMount() {
    await this.fetchRepositoryData();
  }

  async componentDidUpdate(_, prevState) {
    const { issuesState, currentPage } = this.state;
    if (
      prevState.issuesState !== issuesState ||
      prevState.currentPage !== currentPage
    ) {
      await this.fetchRepositoryData();
    }
  }

  fetchRepositoryData = async () => {
    const { match } = this.props;
    const { issuesState, currentPage } = this.state;

    const repositoryName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repositoryName}`),
      api.get(`/repos/${repositoryName}/issues`, {
        params: {
          state: issuesState,
          per_page: 10,
          page: currentPage,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
      hasPreviousPage: String(issues.headers.link).indexOf('rel="prev"') >= 0,
      hasNextPage: String(issues.headers.link).indexOf('rel="next"') >= 0,
    });
  };

  handleSelectChange = event => {
    this.setState({
      issuesState: event.target.value,
      currentPage: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });
  };

  handlePageChange = value => {
    const { currentPage } = this.state;
    this.setState({ currentPage: currentPage + value });
  };

  render() {
    const {
      repository,
      issues,
      loading,
      issuesState,
      hasPreviousPage,
      hasNextPage,
    } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Back to repositories</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <FilterAndPagination>
          <select value={issuesState} onChange={this.handleSelectChange}>
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
          <div>
            <button
              type="button"
              disabled={!hasPreviousPage}
              onClick={() => this.handlePageChange(-1)}
            >
              {"<"}
            </button>
            <button
              type="button"
              disabled={!hasNextPage}
              onClick={() => this.handlePageChange(+1)}
            >
              {">"}
            </button>
          </div>
        </FilterAndPagination>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}
