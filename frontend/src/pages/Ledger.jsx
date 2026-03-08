import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import LedgerHeader from "../components/LedgerHeader";
import LedgerBalanceCard from "../components/LedgerBalanceCard";
import LedgerActionButtons from "../components/LedgerActionButtons";
import LedgerEntriesList from "../components/LedgerEntriesList";
import LedgerEntryModal from "../components/LedgerEntryModal";

const API = "http://localhost:3000/api/ledger";

function Ledger() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState(null);
    const [entries, setEntries] = useState([]);
    const [netBalance, setNetBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [entryType, setEntryType] = useState("credit"); // credit = gave, debit = got
    const [formLoading, setFormLoading] = useState(false);

    const fetchLedgerData = async () => {
        try {
            const res = await fetch(`${API}/customers/${id}/entries`, { credentials: "include" });
            const data = await res.json();

            if (res.ok) {
                setCustomer(data.customer);
                setNetBalance(data.net_balance);
                setEntries(data.entries);
            } else {
                toast.error(data.message || "Failed to load ledger data");
                if (res.status === 404) navigate("/customers");
            }
        } catch (error) {
            toast.error("Failed to fetch ledger");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLedgerData();
    }, [id]);

    const handleAddEntry = async (entryData) => {
        setFormLoading(true);

        try {
            const res = await fetch(`${API}/customers/${id}/entries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(entryData),
            });
            const data = await res.json();

            if (res.ok) {
                setShowModal(false);
                fetchLedgerData();
                toast.success("Transaction recorded");
            } else {
                toast.error(data.message || "Failed to add entry");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setFormLoading(false);
        }
    };

    const openModal = (type) => {
        setEntryType(type);
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto pb-10">
                <div className="flex justify-center items-center py-20 min-h-[400px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-neutral-200 dark:border-neutral-600 border-t-indigo-500"></div>
                </div>
            </div>
        );
    }

    if (!customer) return null;

    return (
        <div className="max-w-4xl mx-auto pb-10">
            {/* Header / Back Link */}
            <LedgerHeader customer={customer} />

            {/* Net Balance Banner */}
            <LedgerBalanceCard netBalance={netBalance} />

            {/* Action Buttons */}
            <LedgerActionButtons onOpenModal={openModal} />

            {/* Entries List */}
            <LedgerEntriesList entries={entries} customerName={customer.name} />

            {/* Add Entry Modal */}
            <LedgerEntryModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleAddEntry}
                entryType={entryType}
                customerName={customer.name}
                formLoading={formLoading}
            />
        </div>
    );
}

export default Ledger;
