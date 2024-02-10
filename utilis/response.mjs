export const responseFunc = (res, stat, msg, data) => {
  const status = Number(stat);
  if (!data) {
    return res.status(status).send({ message: msg });
  }
  return res.status(status).send({ message: msg, data: data });
};
export default responseFunc;
