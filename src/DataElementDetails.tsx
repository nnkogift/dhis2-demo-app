import React, {useEffect} from "react";
import {useDataQuery} from "@dhis2/app-runtime";
import {Button, CircularLoader} from "@dhis2/ui";


const singleDEQuery = {
		dE: {
				resource: "dataElements",
				id: ({id}: any) => id
		}
}


export interface DataElementDetailsProps {
		id: string;
}

export function DataElementDetails({id}: DataElementDetailsProps) {
		const {loading, data, error, refetch} = useDataQuery<{
				dE: { id: string; displayName: string; valueType: string; }
		}>(singleDEQuery, {
				variables: {
						id
				}
		});


		useEffect(() => {
				if(id){
						refetch({
								id
						})
				}
		}, [id]);

		if (loading) {
				return (
						<div style={{
								width: "100%",
								height: "100%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center"
						}}>
								<CircularLoader small/>
						</div>
				)
		}

		if (error) {
				return (
						<div style={{
								width: "100%",
								height: "100%",
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center"
						}}>
								<h1>Error</h1>
								<span>{error.message}</span>
								<Button onClick={refetch}>Refresh</Button>
						</div>
				)
		}

		return (
				<div>
						<h3>{data?.dE.displayName}</h3>
						<span><b>ID</b> {data?.dE.id}</span>
						<span><b>Value Type</b> {data?.dE.valueType}</span>
				</div>
		)
}
