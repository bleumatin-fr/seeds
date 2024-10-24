import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useProjects from './context/useProjects';
import { Loading } from './Project';

const NewProject = () => {
  let [searchParams] = useSearchParams();
  let navigate = useNavigate();
  const called = useRef(false);
  const { create } = useProjects();

  useEffect(() => {
    if (called.current) {
      return;
    }
    called.current = true;
    (async () => {
      let values;
      try {
        values = JSON.parse(searchParams.get('values') || '');
      } catch (error) {
        console.error(error);
      }
      const type = searchParams.get('type');
      if (!type) {
        throw new Error('Type is required');
      }
      const newProject = await create({ values, type });
      navigate(`/project/${newProject._id}`, {
        replace: true,
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Loading />;
};

export default NewProject;
