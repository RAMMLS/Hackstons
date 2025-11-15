import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ArticleDisplay.css';

export default function ArticleDisplay({ article, topics, onReset }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(article);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="article-display-container">
      <div className="article-header">
        <h2>Ваша персонализированная статья</h2>
        <div className="article-actions">
          <button 
            onClick={handleCopy} 
            className="copy-button"
            title="Копировать статью"
          >
            {copied ? '✓ Скопировано!' : '📋 Копировать'}
          </button>
          <button 
            onClick={onReset} 
            className="reset-button"
            title="Создать новую статью"
          >
            ✨ Новая статья
          </button>
        </div>
      </div>

      <div className="article-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ node, ...props }) => (
              <p className="article-paragraph" {...props} />
            ),
            a: ({ node, ...props }) => (
              <a
                className="article-link"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              />
            ),
          }}
        >
          {article}
        </ReactMarkdown>
      </div>

      {topics && topics.length > 0 && (
        <div className="topics-section">
          <h3>Интересные темы</h3>
          <div className="topics-grid">
            {topics.map((topic, index) => (
              <a
                key={index}
                href={topic.url}
                target="_blank"
                rel="noopener noreferrer"
                className="topic-card"
              >
                <span className="topic-icon">🔗</span>
                <span className="topic-title">{topic.title}</span>
                <span className="topic-arrow">→</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

