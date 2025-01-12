import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import { useEffect, useRef, useState } from 'react';
import './App.css';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

const convertHtmlToBlocks = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const blocks: any[] = [];

  doc.body.childNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      switch (element.tagName.toLowerCase()) {
        case 'p':
          blocks.push({
            type: 'paragraph',
            data: { text: element.innerHTML }
          });
          break;
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          blocks.push({
            type: 'header',
            data: {
              text: element.innerHTML,
              level: parseInt(element.tagName.charAt(1))
            }
          });
          break;
        case 'ul':
        case 'ol':
          blocks.push({
            type: 'list',
            data: {
              style: element.tagName.toLowerCase() === 'ol' ? 'ordered' : 'unordered',
              items: Array.from(element.children).map(li => li.innerHTML)
            }
          });
          break;
      }
    }
  });
  return blocks;
};

const convertToHtml = (blocks: any[]) => {
  return blocks.map(block => {
    switch (block.type) {
      case 'header':
        return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
      case 'paragraph':
        return `<p>${block.data.text}</p>`;
      case 'list':
        {
          const listItems = block.data.items
            .map((item: string) => `<li>${item}</li>`)
            .join('');
          return block.data.style === 'ordered'
            ? `<ol>${listItems}</ol>`
            : `<ul>${listItems}</ul>`;
        }
      default:
        return '';
    }
  }).join('');
};

const htmlFromApi = '<p>asdfasdf</p><p>asfasdf</p><p>asdfasdfasdf</p><h2>asdfasdf</h2>';
const blocks = convertHtmlToBlocks(htmlFromApi);
console.log('Blocks===>:', blocks);

function App() {
  const editorRef = useRef<EditorJS>();
  const editorHolder = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [htmlOutput, setHtmlOutput] = useState<string>('');


  const handleSave = async () => {
    if (editorRef.current && isReady) {
      try {
        const savedData = await editorRef.current.save();
        console.log('Saved data:', savedData);
        const html = convertToHtml(savedData.blocks);
        setHtmlOutput(html);
        console.log('HTML Output:', html);
        return savedData;
      } catch (error) {
        console.error('Saving failed:', error);
      }
    }
  };

  useEffect(() => {
    if (!editorHolder.current) return;

    const editor = new EditorJS({
      holder: editorHolder.current,
      tools: {
        header: Header,
        list: List
      },
      onChange: (api) => {
        console.log('Content changed');
      },
      data: {
        blocks: blocks,
      },
      onReady: () => {
        editorRef.current = editor;
        setIsReady(true);
      }
    });

    // function addBlocks(blocks) { for (const i of blocks) { editor.blocks.insert(i) } }
    // Cleanup function
    return () => {
      editor.isReady
        .then(() => {
          editor.destroy();
          editorRef.current = undefined;

        })
        .catch(e => console.error('ERROR editor cleanup', e));
    };
  }, []);

  return (
    <div>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Editor.js with React</h1>
      <button onClick={handleSave} disabled={!isReady}>Save</button>
      <div
        ref={editorHolder}
        style={{
          border: '1px solid #ddd',
          borderRadius: '5px',
          minHeight: '300px',
          padding: '10px',
        }}
      ></div>
      <div
        style={{
          marginTop: '20px',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '5px'
        }}
      >
        <h3>HTML Output:</h3>
        <div dangerouslySetInnerHTML={{ __html: htmlOutput }}></div>
        <pre style={{ background: '#f5f5f5', padding: '10px' }}>
          {htmlOutput}
        </pre>
      </div>
    </div>
  );
}

export default App;
