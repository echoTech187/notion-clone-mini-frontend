"use client";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

// Our <Editor> component we can reuse later
export default function Editor(content, editable = true, handleUploadFile) {
    console.log(content);
    // Creates a new editor instance.
    const editor = useCreateBlockNote({
        initialContent: content.content,
        isEditable: editable,
        uploadFile: handleUploadFile
    });
    editor.editable = editable;

    // Renders the editor instance using a React component.
    return <BlockNoteView editor={editor} editable={editable} theme={'light'} />;
}