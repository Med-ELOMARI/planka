

export default (url) => {
  const filename = url.split('/').pop().toLowerCase();

  let extension = filename.slice((Math.max(0, filename.lastIndexOf('.')) || Infinity) + 1);
  extension = extension ? extension.toLowerCase() : null;

  return {
    filename,
    extension,
  };
};
