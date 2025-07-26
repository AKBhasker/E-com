import { useSearchParams } from "react-router-dom";


const SortOptions = () => {
  const [SearchParams, setSearchParams] = useSearchParams();
  const handleSortChange = (e) => {
    const sortBy = e.target.value;
    SearchParams.set("sortBy", sortBy)
    setSearchParams(SearchParams)
  }
  return (
    <div className="mb-4 flex items-center justify-end">
      <select id="sort" 
      onChange={handleSortChange}
      value={SearchParams.get("sortBy") || ""}
      className="border p-2 rounded-md focus:outline-none">
        <option value="">Default</option>
        <option value="priceAsc">Price: Low to High</option>
        <option value="priceDesc">Price: High to Low</option>
        <option value="popularity">Popularity</option>
      </select>
    </div>
  )
}

export default SortOptions