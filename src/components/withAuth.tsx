import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext"; // replace with your auth context path
import { NextPage } from "next";

const withAuth = (WrappedComponent: NextPage) => {
    const WithAuth: NextPage = (props) => {
        const { user, loading } = useAuth();
        const authContext = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!loading && !user) router.push("/auth/login");
        }, [user, loading]);

        return user ? <WrappedComponent {...props} /> : null;
    };

    return WithAuth;
};

export default withAuth;