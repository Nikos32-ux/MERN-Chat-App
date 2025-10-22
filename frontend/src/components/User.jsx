import React from 'react'

const User = ({user,isOnline,unread,currentUser,selectedUser,lastMessages,sidebarIsTypingId,handleSelectUser}) => {
    return (
        <div
            key={user._id}
            onClick={() => handleSelectUser(user)}
            className={`flex items-center gap-3 p-3 rounded-lg mb-2 cursor-pointer transition-all duration-300
          ${selectedUser?._id === user._id ? "bg-gradient-to-b from-gray-700 via-gray-800 to-gray-600 "
                    : "bg-gray-700 hover:bg-gray-600"}`}
        >
            <div className="relative">
                <img
                    src={user.profile}
                    alt={user.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover transition-all duration-300"
                />
                <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-white ${isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                />
            </div>

            <div className="flex flex-col w-full">
                <span className="font-medium text-white ">{user.name}</span>
                {sidebarIsTypingId === user._id ? (
                    <span className="text-sm text-red-300 ">
                        {`${user.name.split(" ")[0]} is typing...`}
                    </span>
                ) : (
                    <div className="font-normal flex justify-between text-red-200 text-sm max-w-[150px] sm:max-w-[200px]">
                        <span className="truncate flex-1 ">
                            {lastMessages?.message
                                ? currentUser._id === lastMessages?.userId
                                    ? `You: ${lastMessages?.message}`
                                    : lastMessages?.message
                                : "no message yet"}
                        </span>
                        {currentUser._id === lastMessages?.userId ? (
                            <span className={`ml-2 ${lastMessages?.sidebarRead ? "text-[rgba(158,10,42,0.82)]" : "text-[rgba(110,111,121,0.82)]"}`}>
                                ✓✓
                            </span>
                        ) : ""}
                    </div>
                )}
            </div>

            {unread > 0 && (
                <span className="ml-auto bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow-md">
                    {unread}
                </span>
            )}
        </div>

    )
}

export default User
