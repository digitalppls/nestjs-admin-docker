export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  LocalHost = 'localhost',
  Test = 'test',
}
export enum NodeEnvShort {
  Development = 'dev',
  Production = 'prod',
  LocalHost = 'local',
  Test = 'test',
}

export function shortEnv(env: NodeEnv): NodeEnvShort {
  switch (env) {
    case NodeEnv.Development:
      return NodeEnvShort.Development;
    case NodeEnv.Production:
      return NodeEnvShort.Production;
    case NodeEnv.LocalHost:
      return NodeEnvShort.LocalHost;
    case NodeEnv.Test:
      return NodeEnvShort.Test;
  }
}