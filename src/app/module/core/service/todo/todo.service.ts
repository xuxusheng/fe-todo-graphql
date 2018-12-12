import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  constructor(private apollo: Apollo) {}

  create(title: string, description: string) {
    return this.apollo.mutate({
      mutation: gql`
        mutation createTodo($title: String!, $description: String) {
          createTodo(title: $title, description: $description) {
            id
          }
        }
      `,
      variables: {
        title,
        description
      }
    });
  }

  update(id: number, title: string, description: string) {
    return this.apollo.mutate({
      mutation: gql`
        mutation updateTodo($id: Int!, $title: String!, $description: String) {
          updateTodo(id: $id, title: $title, description: $description)
        }
      `
    });
  }
}
