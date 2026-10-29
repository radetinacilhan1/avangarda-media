import React, { forwardRef, useEffect, useMemo, useState } from "react";
import { Badge, Button, Flex, ModalBody, ModalFooter, ModalHeader, ModalLayout, TextInput, Typography } from "@strapi/design-system";
import { getFetchClient, prefixFileUrlWithBackendUrl, useCMEditViewDataManager, useRBAC } from "@strapi/helper-plugin";
import styled, { createGlobalStyle } from "styled-components";
import { GALLERY_UID, galleryMediaIds, mediaId } from "../../gallery-workflow-utils";

const permissions = { read: [{ action: "plugin::upload.read", subject: null }] };
const PAGE_SIZE = 12;
// ModalLayout fixes its overlay at z-index 4 without a public overlay prop.
// Raise only the Portal containing our explicit dialog marker above the
// existing mobile toolbar. No Strapi classes or generated selectors are used.
const PickerPortalLayer = createGlobalStyle`
  body > div:has([data-avangarda-gallery-picker="true"]) {
    position: relative;
    z-index: 1100;
  }
`;
const Grid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 190px), 1fr)); gap: 12px; margin-top: 16px;
`;
const Card = styled.button`
  width: 100%; min-width: 0; padding: 8px; text-align: left; cursor: pointer;
  color: ${({ theme }) => theme.colors.neutral800}; background: ${({ theme }) => theme.colors.neutral0};
  border: 2px solid ${({ theme, $selected }) => $selected ? theme.colors.primary600 : theme.colors.neutral200}; border-radius: 4px;
  img { width: 100%; height: 130px; object-fit: contain; background: ${({ theme }) => theme.colors.neutral100}; }
  strong { display: block; margin: 8px 0; font-size: 14px; line-height: 1.4; overflow-wrap: anywhere; }
  &:focus-visible { outline: 3px solid ${({ theme }) => theme.colors.primary600}; outline-offset: 2px; }
`;
const Controls = styled.div`
  display: flex; flex-wrap: wrap; gap: 12px; align-items: end;
  > div:first-child { flex: 1; min-width: min(100%, 220px); }
`;
const Selection = styled.div`
  margin-top: 12px; color: ${({ theme }) => theme.colors.neutral800}; overflow-wrap: anywhere; line-height: 1.5;
`;

function ExistingPhotoPicker({ onClose, onSelect, value, galleryIds }) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(value || null);
  const [state, setState] = useState({ loading: true, results: [], pagination: {}, error: "" });
  const [retry, setRetry] = useState(0);
  const { allowedActions, isLoading: permissionsLoading } = useRBAC(permissions);
  const canRead = allowedActions.canRead;

  useEffect(() => {
    if (permissionsLoading || !canRead) return undefined;
    let active = true;
    setState((previous) => ({ ...previous, loading: true, error: "" }));
    const params = { page, pageSize: PAGE_SIZE, sort: "name:ASC", filters: { $and: [{ mime: { $startsWith: "image/" } }] } };
    // Same server-side search contract used by Strapi's native media picker.
    // No folder filter: searches include the whole library, not just this page.
    if (submittedQuery) params._q = encodeURIComponent(submittedQuery);
    getFetchClient().get("/upload/files", { params }).then(({ data }) => {
      if (!active) return;
      setState({ loading: false, results: data.results || [], pagination: data.pagination || {}, error: "" });
    }).catch((error) => {
      if (!active) return;
      const status = error?.response?.status;
      const message = status === 403 ? "Nemate dozvolu za čitanje Media Library." : "Media Library trenutno nije dostupna. Pokušajte ponovo. Izbor i nesnimljeni unosi u galeriji su sačuvani.";
      setState((previous) => ({ ...previous, loading: false, error: message }));
    });
    return () => { active = false; };
  }, [page, submittedQuery, canRead, permissionsLoading, retry]);

  const search = () => { setSubmittedQuery(query.trim()); setPage(1); };
  const pageCount = state.pagination.pageCount || 1;
  return <ModalLayout data-avangarda-gallery-picker="true" onClose={onClose} labelledBy="gallery-photo-picker-title">
    <PickerPortalLayer />
    <ModalHeader><Typography as="h2" fontWeight="bold" id="gallery-photo-picker-title">Pretraži postojeće fotografije</Typography></ModalHeader>
    <ModalBody>
      <Typography as="p">Fotografije su već uploadovane u Media Library. Izaberite fajl za ovaj red; ponovno korišćenje ne pravi novi upload.</Typography>
      <Controls style={{ marginTop: 16 }}>
        <TextInput name="gallery-media-search" label="Naziv fajla, alt tekst ili opis" placeholder="Pretraži celu Media Library" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => {
          if (event.key === "Enter") { event.preventDefault(); event.stopPropagation(); search(); }
        }} />
        <Button type="button" onClick={search}>Pretraži</Button>
        <Button type="button" variant="tertiary" onClick={() => { setQuery(""); setSubmittedQuery(""); setPage(1); }}>Poništi pretragu</Button>
      </Controls>
      <Selection aria-live="polite">{selected?.name ? <>Izabrano: <strong>{selected.name}</strong>{galleryIds.has(mediaId(selected)) && <> · Već u ovoj galeriji</>}</> : "Još nije izabrana fotografija."}</Selection>
      {!permissionsLoading && !canRead && <Typography as="p" textColor="danger600" role="alert">Nemate dozvolu za čitanje Media Library.</Typography>}
      {state.error && <div role="alert"><Typography as="p" textColor="danger600">{state.error}</Typography><Button type="button" variant="secondary" onClick={() => setRetry((current) => current + 1)}>Pokušaj ponovo</Button></div>}
      {(state.loading || permissionsLoading) && <Typography as="p" role="status">Učitavanje fotografija…</Typography>}
      {!state.loading && !state.error && canRead && <>
        <Grid aria-label="Rezultati pretrage fotografija">{state.results.map((asset) => {
          const isSelected = mediaId(selected) === mediaId(asset);
          const thumbnail = asset.formats?.thumbnail?.url || asset.formats?.small?.url || asset.url;
          return <Card key={asset.id} type="button" $selected={isSelected} aria-pressed={isSelected} onClick={() => setSelected(asset)}>
            {thumbnail && <img src={prefixFileUrlWithBackendUrl(thumbnail)} alt="" loading="lazy" />}
            <strong>{asset.name}</strong>
            {galleryIds.has(mediaId(asset)) ? <Badge>Već u ovoj galeriji</Badge> : <Typography variant="pi">U Media Library</Typography>}
            {isSelected && <Typography as="p" variant="pi" fontWeight="bold">Izabrana za ovaj red</Typography>}
          </Card>;
        })}</Grid>
        {state.results.length === 0 && <Typography as="p" role="status">Nema fotografija za ovu pretragu.</Typography>}
        <Flex gap={3} justifyContent="center" wrap="wrap" style={{ marginTop: 16 }}>
          <Button type="button" variant="tertiary" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Prethodna</Button>
          <Typography>Stranica {page} / {pageCount} · {state.pagination.total || 0} fotografija</Typography>
          <Button type="button" variant="tertiary" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>Sledeća</Button>
        </Flex>
      </>}
    </ModalBody>
    <ModalFooter startActions={<Button type="button" variant="tertiary" onClick={onClose}>Otkaži</Button>} endActions={<Button type="button" disabled={!selected || !canRead} onClick={() => onSelect(selected)}>Koristi izabranu fotografiju</Button>} />
  </ModalLayout>;
}

export function createGalleryMediaField(NativeMedia) {
  return forwardRef(function GalleryMediaField(props, ref) {
    const { slug, modifiedData } = useCMEditViewDataManager();
    const [open, setOpen] = useState(false);
    const galleryIds = useMemo(() => galleryMediaIds(modifiedData?.images), [modifiedData?.images]);
    const isGalleryImage = slug === GALLERY_UID && /^images\.\d+\.image$/.test(props.name);
    if (!isGalleryImage) return <NativeMedia {...props} ref={ref} />;
    const value = Array.isArray(props.value) ? props.value[0] : props.value;
    return <>
      <div style={{ marginBottom: 12 }}><Button id={props.name} type="button" variant="secondary" aria-invalid={Boolean(props.error)} disabled={props.disabled} onClick={() => setOpen(true)}>Pretraži postojeće fotografije</Button></div>
      <NativeMedia {...props} ref={ref} />
      {open && <ExistingPhotoPicker value={value} galleryIds={galleryIds} onClose={() => setOpen(false)} onSelect={(asset) => {
        props.onChange({ target: { name: props.name, value: asset } });
        setOpen(false);
      }} />}
    </>;
  });
}
