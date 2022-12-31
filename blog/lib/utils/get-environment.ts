export const getEnvironment = (environmentVariables: string[]): { [name: string]: string } => {
  return environmentVariables.reduce((acc, key) => {
    if (!process.env[key]) {
      throw new Error(`Missing environment variable: ${key}`)
    }

    acc[key] = process.env[key]

    return acc
  }, {} as any)
}

export const getEnvironmentUnsafe = (environmentVariables: string[]): { [name: string]: string } => {
  return environmentVariables.reduce((acc, key) => {
    acc[key] = process.env[key]

    return acc
  }, {} as any)
}
