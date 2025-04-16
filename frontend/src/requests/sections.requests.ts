const getSections = async () => {
  const res = await fetch("/api/links");
  return res.json();
};

export default getSections;
