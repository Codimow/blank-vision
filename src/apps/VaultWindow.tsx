'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FolderOpen, FileText, Save, Plus, Import, Download, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { clsx } from 'clsx';

interface VaultFile {
  name: string;
  kind: 'file' | 'directory';
  handle: FileSystemHandle;
  children?: VaultFile[];
}

export default function VaultWindow() {
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileSystemFileHandle | null>(null);
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [vaultName, setVaultName] = useState('No Vault Linked');

  // Load directory structure
  const scanDirectory = async (handle: FileSystemDirectoryHandle): Promise<VaultFile[]> => {
    const entries: VaultFile[] = [];
    for await (const entry of handle.values()) {
      if (entry.kind === 'directory') {
        entries.push({
          name: entry.name,
          kind: 'directory',
          handle: entry,
          children: await scanDirectory(entry as FileSystemDirectoryHandle)
        });
      } else if (entry.name.endsWith('.md')) {
        entries.push({
          name: entry.name,
          kind: 'file',
          handle: entry
        });
      }
    }
    return entries.sort((a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === 'directory' ? -1 : 1));
  };

  const handleOpenVault = async () => {
    try {
      const handle = await (window as any).showDirectoryPicker();
      setDirectoryHandle(handle);
      setVaultName(handle.name);
      const structure = await scanDirectory(handle);
      setFiles(structure);
    } catch (err) {
      console.error('Failed to open directory:', err);
    }
  };

  const handleFileClick = async (fileHandle: FileSystemFileHandle) => {
    const file = await fileHandle.getFile();
    const text = await file.text();
    setSelectedFile(fileHandle);
    setContent(text);
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    try {
      const writable = await (selectedFile as any).createWritable();
      await writable.write(content);
      await writable.close();
      alert('Note saved to vault!');
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Error saving note. Did you grant write permissions?');
    }
  };

  const handleNewNote = async () => {
    if (!directoryHandle) {
        // Ephemeral local note if no vault is linked
        setSelectedFile(null);
        setContent('# New Note\n\nWrite something amazing...');
        return;
    }

    const name = prompt('Enter note name (e.g. project-idea.md):');
    if (!name) return;
    const fileName = name.endsWith('.md') ? name : `${name}.md`;

    try {
      const newFileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
      setSelectedFile(newFileHandle);
      setContent(`# ${name}\n\nCreated in Blank Vision.`);
      // Refresh file list
      const structure = await scanDirectory(directoryHandle);
      setFiles(structure);
    } catch (err) {
      console.error('Failed to create file:', err);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0d1117] text-neutral-300 font-sans overflow-hidden">
      {/* Vault Toolbar */}
      <div className="bg-[#161b22] border-b border-white/10 p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
                <FolderOpen size={18} className="text-purple-400" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-white leading-none">{vaultName}</h3>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mt-1">Obsidian Bridge</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            {!directoryHandle ? (
                <button 
                    onClick={handleOpenVault}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-purple-900/20"
                >
                    <Import size={14} />
                    Link Vault
                </button>
            ) : (
                <button 
                    onClick={handleNewNote}
                    className="p-2 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-colors"
                    title="New Note"
                >
                    <Plus size={18} />
                </button>
            )}
            {selectedFile && (
                <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all"
                >
                    <Save size={14} />
                    Save
                </button>
            )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar / File Tree */}
        {directoryHandle && (
            <div className="w-48 border-r border-white/5 bg-[#090c10] overflow-y-auto p-2 custom-scrollbar">
                <div className="space-y-1">
                    {files.map((file, i) => (
                        <div 
                            key={i}
                            onClick={() => file.kind === 'file' && handleFileClick(file.handle as FileSystemFileHandle)}
                            className={clsx(
                                "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors",
                                selectedFile?.name === file.name ? "bg-purple-500/10 text-purple-400" : "hover:bg-white/5 text-neutral-500 hover:text-neutral-300"
                            )}
                        >
                            {file.kind === 'directory' ? <FolderOpen size={14} /> : <FileText size={14} />}
                            <span className="truncate">{file.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Editor / Preview Area */}
        <div className="flex-1 flex flex-col bg-[#0d1117]">
            <div className="flex border-b border-white/5 bg-[#090c10]/50">
                <button 
                    onClick={() => setIsEditing(true)}
                    className={clsx("px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2", isEditing ? "border-purple-500 text-purple-400" : "border-transparent text-neutral-600")}
                >
                    Editor
                </button>
                <button 
                    onClick={() => setIsEditing(false)}
                    className={clsx("px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2", !isEditing ? "border-purple-500 text-purple-400" : "border-transparent text-neutral-600")}
                >
                    Preview
                </button>
            </div>

            <div className="flex-1 relative overflow-hidden">
                {isEditing ? (
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-full bg-transparent p-6 outline-none resize-none font-mono text-sm leading-relaxed text-neutral-400 focus:text-neutral-200 transition-colors custom-scrollbar"
                        placeholder="Start typing your note..."
                    />
                ) : (
                    <div className="w-full h-full p-8 overflow-y-auto prose prose-invert prose-sm max-w-none custom-scrollbar">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
      </div>
      
      {/* Sync Status */}
      <div className="bg-[#090c10] border-t border-white/5 px-4 py-2 flex items-center justify-between text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
         <div className="flex items-center gap-2">
            <div className={clsx("w-1.5 h-1.5 rounded-full", directoryHandle ? "bg-emerald-500" : "bg-neutral-800")} />
            <span>{directoryHandle ? 'Vault Synced' : 'Offline Mode'}</span>
         </div>
         {selectedFile && <span>{selectedFile.name}</span>}
      </div>
    </div>
  );
}
