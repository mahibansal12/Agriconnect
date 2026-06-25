import { useParams, Link } from "react-router-dom";
import { mockSchemes } from "../../mockdata/schemesMock";

function SchemeDetail() {
  const { id } = useParams();
  const scheme = mockSchemes.find((s) => s._id === id);

  if (!scheme) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-gray-500">Scheme not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 px-6 py-10">
      <Link to="/schemes" className="text-green-700 text-sm mb-4 inline-block">&larr; Back to all schemes</Link>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 max-w-2xl">
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-2xl font-bold text-green-800">{scheme.title}</h1>
          <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 capitalize whitespace-nowrap">
            {scheme.category}
          </span>
        </div>

        <p className="text-gray-700 mb-5">{scheme.description}</p>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400">Eligibility</p>
            <p className="text-gray-700">{scheme.eligibility}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Benefits</p>
            <p className="text-gray-700">{scheme.benefits}</p>
          </div>
          {scheme.lastDate && (
            <div>
              <p className="text-sm text-gray-400">Last Date to Apply</p>
              <p className="text-gray-700">{new Date(scheme.lastDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
          )}
        </div>

        {scheme.applicationLink && (
          <a
            href={scheme.applicationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6 px-5 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
          >
            Apply Now &rarr;
          </a>
        )}
      </div>
    </div>
  );
}

export default SchemeDetail;