import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function usePublicContent(name) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    api.get(`/public/content/${name}`)
      .then(({ data }) => { if (active) setData(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setData([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [name]);
  return { data, loading };
}
