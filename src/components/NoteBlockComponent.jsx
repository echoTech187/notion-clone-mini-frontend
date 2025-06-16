'use client';

import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill/dist/quill.snow.css';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import Select from 'react-select';

// Import bahasa untuk SyntaxHighlighter
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import html from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash';

SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('html', html);
SyntaxHighlighter.registerLanguage('bash', bash);


export const TextBlock = ({ id, content, onChange }) => {
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    const formats = [
        'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent', 'link', 'image'
    ];

    return (
        <div className="quill-editor-container">
            <ReactQuill
                theme="snow"
                value={content || ''}
                onChange={(html) => onChange(id, html)}
                modules={modules}
                formats={formats}
                placeholder="Type your rich text here..."
            />
        </div>
    );
};

export const ChecklistItem = ({ id, content, checked, onChange, onToggle }) => (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
        <input
            type="checkbox"
            checked={checked}
            onChange={() => onToggle(id)}
            className="form-checkbox h-5 w-5 text-blue-600 rounded"
        />
        <input
            type="text"
            className={`flex-grow border-b bg-transparent outline-none ${checked ? 'line-through text-gray-500' : ''}`}
            placeholder="Checklist item"
            value={content}
            onChange={(e) => onChange(id, e.target.value)}
        />
    </div>
);

export const ImageBlock = ({ id, url, alt, onChange, onUpload }) => (
    <div className="flex flex-col items-center p-2 border border-dashed border-gray-300 rounded-md">
        {url ? (
            <img src={url} alt={alt || 'Uploaded image'} className="max-w-full h-auto rounded-md mb-2" />
        ) : (
            <label className="w-full text-center py-4 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-md">
                <span className="text-blue-500 font-semibold">Upload Image</span>
                <input type="file" accept="image/*" onChange={(e) => onUpload(id, e.target.files[0])} className="hidden" />
            </label>
        )}
        <input
            type="text"
            className="w-full p-1 mt-2 text-sm text-center border-b outline-none"
            placeholder="Image description (alt text)"
            value={alt || ''}
            onChange={(e) => onChange(id, 'alt', e.target.value)}
        />
    </div>
);

const languageOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'css', label: 'CSS' },
    { value: 'html', label: 'HTML' },
    { value: 'bash', label: 'Bash' },
    { value: 'text', label: 'Plain Text' }
];

export const CodeBlock = ({ id, content, language, onChange, onLanguageChange }) => {
    return (
        <div className="bg-gray-800 rounded-md overflow-hidden">
            <div className="p-2 border-b border-gray-700">
                <Select
                    options={languageOptions}
                    value={languageOptions.find(opt => opt.value === language)}
                    onChange={(selectedOption) => onLanguageChange(id, selectedOption ? selectedOption.value : 'text')}
                    className="w-full text-sm"
                    classNamePrefix="react-select"
                    styles={{
                        control: (provided) => ({
                            ...provided,
                            backgroundColor: '#4a5568',
                            borderColor: '#2d3748',
                            color: 'white',
                        }),
                        singleValue: (provided) => ({ ...provided, color: 'white' }),
                        input: (provided) => ({ ...provided, color: 'white' }),
                        menu: (provided) => ({ ...provided, backgroundColor: '#4a5568' }),
                        option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isFocused ? '#2d3748' : '#4a5568',
                            color: 'white',
                        }),
                    }}
                />
            </div>
            <textarea
                className="w-full p-4 bg-gray-900 text-white font-mono text-sm resize-y focus:outline-none"
                placeholder="Write your code here..."
                value={content}
                onChange={(e) => onChange(id, e.target.value)}
                rows="10"
                style={{ tabSize: 4 }}
            />
            {content && language && language !== 'text' && (
                <div className="p-4 bg-gray-900 overflow-auto border-t border-gray-700">
                    <SyntaxHighlighter language={language}>
                        {content}
                    </SyntaxHighlighter>
                </div>
            )}
        </div>
    );
};

export const BlockRenderer = ({ block, onBlockContentChange, onBlockToggle, onImageUpload, onBlockAltChange, onBlockLanguageChange }) => {
    switch (block.type) {
        case 'text':
            return <TextBlock id={block.id} content={block.content} onChange={onBlockContentChange} />;
        case 'checklist':
            return (
                <ChecklistItem
                    id={block.id}
                    content={block.content}
                    checked={block.checked}
                    onChange={onBlockContentChange}
                    onToggle={onBlockToggle}
                />
            );
        case 'image':
            return (
                <ImageBlock
                    id={block.id}
                    url={block.url}
                    alt={block.alt}
                    onChange={onBlockAltChange}
                    onUpload={onImageUpload}
                />
            );
        case 'code':
            return (
                <CodeBlock
                    id={block.id}
                    content={block.content}
                    language={block.language || 'text'}
                    onChange={onBlockContentChange}
                    onLanguageChange={onBlockLanguageChange}
                />
            );
        default:
            return null;
    }
};