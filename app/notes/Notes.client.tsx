"use client";

import React, { useState } from "react";
import css from "./NotesPage.module.css";
import SearchBox from "../../components/SearchBox/SearchBox";
import Pagination from "../../components/Pagination/Pagination";
import NoteList from "../../components/NoteList/NoteList";
import Modal from "../../components/Modal/Modal";
import NoteForm from "../../components/NoteForm/NoteForm";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchNotes } from "../../lib/api";

const PER_PAGE = 12;

export default function NotesClient() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 500);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notes", page, PER_PAGE, debouncedSearch],
    queryFn: () =>
      fetchNotes({ page, perPage: PER_PAGE, search: debouncedSearch }),
    staleTime: 1000 * 60,
    placeholderData: keepPreviousData,
  });

  const totalPages = data?.meta?.totalPages ?? 1;
  const notes = data?.data ?? [];

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
        />
        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
        <button className={css.button} onClick={() => setIsModalOpen(true)}>
          Create note +
        </button>
      </header>

      <main className={css.main}>
        {isLoading && <p className={css.status}>Loading notes...</p>}
        {isError && <p className={css.status}>Failed to load notes</p>}
        {!isLoading && !isError && <NoteList notes={notes} />}
      </main>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm
            onSuccess={() => setIsModalOpen(false)}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
