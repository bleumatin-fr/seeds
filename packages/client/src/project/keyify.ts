const keyify = (key: string) =>
    (key || '')
      .replace(/\s/g, '_')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase();
  
  export default keyify;
  