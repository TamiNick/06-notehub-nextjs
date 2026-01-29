import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import css from "./NoteForm.module.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote } from "../../lib/api";
import type { NoteTag, Note } from "../../types/note";

interface NoteFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormValues {
  title: string;
  content: string;
  tag: NoteTag;
}

const schema = Yup.object().shape({
  title: Yup.string()
    .min(3, "Min 3 chars")
    .max(50, "Max 50 chars")
    .required("Required"),
  content: Yup.string().max(500, "Max 500 chars"),
  tag: Yup.mixed<NoteTag>()
    .oneOf(["Todo", "Work", "Personal", "Meeting", "Shopping"])
    .required("Required"),
});

const NoteForm: React.FC<NoteFormProps> = ({ onSuccess, onCancel }) => {
  const qc = useQueryClient();

  const mutation = useMutation<Note, Error, FormValues>({
    mutationFn: (payload: FormValues) => createNote(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      onSuccess?.();
    },
  });

  return (
    <Formik<FormValues>
      initialValues={{ title: "", content: "", tag: "Todo" }}
      validationSchema={schema}
      onSubmit={(values, { setSubmitting, resetForm }) => {
        mutation.mutate(values, {
          onSettled: () => setSubmitting(false),
          onSuccess: () => resetForm(),
        });
      }}
    >
      {({ isSubmitting }) => (
        <Form className={css.form} noValidate>
          <div className={css.formGroup}>
            <label htmlFor="title">Title</label>
            <Field id="title" name="title" className={css.input} />
            <ErrorMessage name="title" component="span" className={css.error} />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="content">Content</label>
            <Field
              as="textarea"
              id="content"
              name="content"
              rows={8}
              className={css.textarea}
            />
            <ErrorMessage
              name="content"
              component="span"
              className={css.error}
            />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="tag">Tag</label>
            <Field as="select" id="tag" name="tag" className={css.select}>
              <option value="Todo">Todo</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Meeting">Meeting</option>
              <option value="Shopping">Shopping</option>
            </Field>
            <ErrorMessage name="tag" component="span" className={css.error} />
          </div>

          <div className={css.actions}>
            <button
              type="button"
              className={css.cancelButton}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={css.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create note"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default NoteForm;
