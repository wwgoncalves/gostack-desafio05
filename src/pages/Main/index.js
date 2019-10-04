import React, { Component } from "react";
import { FaGithubAlt, FaPlus, FaSpinner } from "react-icons/fa";
import { Link } from "react-router-dom";

import api from "../../services/api";

import Container from "../../components/Container";
import { Form, SubmitButton, List } from "./styles";

export default class Main extends Component {
  state = {
    newRepository: "",
    repositories: [],
    loading: false,
  };

  // Load data from localStorage
  componentDidMount() {
    const repositories = localStorage.getItem("repositories");

    if (repositories) {
      this.setState({
        repositories: JSON.parse(repositories),
      });
    }
  }

  // Save data into localStorage
  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;
    if (prevState.repositories !== repositories) {
      localStorage.setItem("repositories", JSON.stringify(repositories));
    }
  }

  handleInputChange = event => {
    this.setState({ newRepository: event.target.value });
  };

  handleSubmit = async event => {
    event.preventDefault();

    this.setState({ loading: true });

    const { newRepository, repositories } = this.state;

    try {
      const response = await api.get(`/repos/${newRepository}`);

      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRepository: "",
        loading: false,
      });
    } catch (error) {
      this.setState({ loading: false });
    }
  };

  render() {
    const { newRepository, repositories, loading } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositories
        </h1>

        <Form onSubmit={this.handleSubmit}>
          <input
            type="text"
            placeholder="Add repository"
            value={newRepository}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading}>
            {loading ? (
              <FaSpinner color="#fff" size={14} />
            ) : (
              <FaPlus color="#fff" size={14} />
            )}
          </SubmitButton>
        </Form>

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
