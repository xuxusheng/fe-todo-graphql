import { HttpErrorResponse } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ApolloLink, from } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { NzMessageService } from 'ng-zorro-antd';

const uri = '/apps/todo/graph'; // <-- add the URL of the GraphQL server here

// request 发送请求时进行处理
const middleware = new ApolloLink((operation, forward) => {
  return forward(operation);
});

// 对返回进行处理
const afterware = new ApolloLink((operation, forward) => {
  return forward(operation).map(response => {
    console.log('afterware: ', response);
    return response;
  });
});

// 请求错误时
const errorLink = (message: NzMessageService) => {
  return onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      console.error('graphqlErrors: ', graphQLErrors);
    }
    if (networkError) {
      const err = (networkError as HttpErrorResponse).error;
      console.error('networkError: ', networkError);
      if (typeof err === 'string') {
        message.error(err);
      } else {
        if (err && err.meta && err.meta.err_msg) {
          // 错误为 token 过期时， 不弹出报错信息
          message.error(err.meta.err_msg);
        } else {
          message.error('Unknown Error!');
        }
      }
    }
  });
};

export function createApollo(httpLink: HttpLink, message: NzMessageService) {
  const http = httpLink.create({
    uri
  });
  return {
    link: from([middleware, afterware, errorLink(message), http]),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: 'no-cache'
      }
    }
  };
}

@NgModule({
  exports: [ApolloModule, HttpLinkModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink]
    }
  ]
})
export class GraphQLModule {}
