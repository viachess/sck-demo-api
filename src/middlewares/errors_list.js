class CustomError extends Error {
  /**
   *
   * @param { object } props
   * @param { string } props.message - Human-readable error message
   * @param { string } props.name - System error name, e.g. NOT_FOUND_ERROR
   * @param { number } props.code - HTTP Status code of an error
   */
  constructor(props) {
    const { message, name, code } = props;
    super(message);
    return {
      name,
      message,
      code,
    };
  }
}

const NOT_FOUND_ERROR_CONFIG = {
  message: "Requested resource not found",
  name: "NOT_FOUND_ERROR",
  code: 404,
};
const NOT_FOUND_ERROR = new CustomError(NOT_FOUND_ERROR_CONFIG);

const FORBIDDEN_ERROR_CONFIG = {
  message: "Access forbidden",
  name: "FORBIDDEN_ERROR",
  code: 403,
};
const FORBIDDEN_ERROR = new CustomError(FORBIDDEN_ERROR_CONFIG);

const Errors = {
  FORBIDDEN_ERROR,
  NOT_FOUND_ERROR,
};

module.exports = Errors;
