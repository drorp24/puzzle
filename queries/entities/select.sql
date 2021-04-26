SELECT id, geolocation::json->'feedback' as feedback FROM public.entities
ORDER BY doc_id ASC