import ClickableAvatar from './common/ClickableAvatar';

// ... nel rendering delle chat ...

<div className="mobile-container">
  <Header />
  <div className="scroll-container">
    <div className="chat-list divide-y theme-divide no-scrollbar">
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          onSelect={onSelectChat}
          onDelete={onDeleteChat}
          onStartCall={onStartCall}
          formatTimestamp={formatTimestamp}
        />
      ))}
    </div>
  </div>
</div> 