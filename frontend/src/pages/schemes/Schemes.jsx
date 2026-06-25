import { mockSchemes } from "../../mockdata/schemesMock";
import SchemeCard from "../../components/schemes/SchemeCard";
import EligibilityChecker from "../../components/schemes/EligibilityChecker";

function Schemes() {
  return (
    <div className="min-h-screen bg-green-50 px-6 py-10">
      <h1 className="text-3xl font-bold text-green-800 mb-1">Government Schemes</h1>
      <p className="text-gray-600 mb-6">Explore schemes and benefits available for farmers.</p>

      <div className="mb-8 max-w-xl">
        <EligibilityChecker />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockSchemes.map((scheme) => <SchemeCard key={scheme._id} scheme={scheme} />)}
      </div>
    </div>
  );
}

export default Schemes;