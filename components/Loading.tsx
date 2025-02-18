const Loading = () => {
  return (
    <div className="flex items-center justify-center border bg-white rounded-lg p-2">
        <div className="w-6 h-6 border-t-transparent border-solid rounded-full animate-spin border-lime-500 border-2"></div>
        <p className="text-sm text-lime-500 ml-4">Carico i dati...</p>
    </div>
  )
}

export default Loading